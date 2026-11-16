import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import QRCode from 'qrcode';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const body = await request.json();

    // Generate QR code yang valid
    const qrCode = await QRCode.toDataURL('https://kiosk.allamoda.id', {
      width: 300,
      margin: 2,
      color: {
        dark: '#7C3AED',
        light: '#FFFFFF'
      }
    });

    // ✅ MOCK MODE - return fake data untuk testing frontend
    const mockResult = {
      success: true,
      sessionId: `mock_${Date.now()}`,
      imageUrl: 'https://picsum.photos/400/600',
      qrCode: qrCode,  // ← QR yang valid
      generationTime: '2.5s',
      dbSaved: false,
      metadata: {
        ai_model: 'mock-mode',
        prompt: 'Mock prompt for testing'
      }
    };

    console.log('MOCK MODE - returning fake result:', mockResult.sessionId);
    return NextResponse.json(mockResult);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
/*
export async function POST(request) {
  try {
    const {
      subjectPhoto,
      tinggi,
      berat,
      bodyType,
      ageRange,
      garmentPhoto,
      category
    } = await request.json();

    if (!subjectPhoto || !garmentPhoto || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sessionId = `tryon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    const tinggiM = tinggi / 100;
    const bmi = (berat / (tinggiM * tinggiM)).toFixed(1);

    const subjectUrl = await uploadTempImage(subjectPhoto, `${sessionId}_subject`);
    const garmentUrl = await uploadTempImage(garmentPhoto, `${sessionId}_garment`);

    const fullSubjectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${subjectUrl}`;
    const fullGarmentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${garmentUrl}`;

    console.log('Sending to n8n webhook:', { sessionId });

    const n8nResponse = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'generate',
        session_id: sessionId,
        subject_photo_url: fullSubjectUrl,
        garment_photo_url: fullGarmentUrl,
        subject_details: {
          tinggi: parseInt(tinggi),
          berat: parseInt(berat),
          bmi: parseFloat(bmi),
          body_type: bodyType,
          age_range: ageRange
        },
        garment_category: {
          value: category.value,
          label: category.label,
          crop_area: category.crop,
          crop_height_percentage: category.cropHeightPercentage || 50
        }
      }),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      throw new Error(`n8n webhook failed: ${n8nResponse.status} - ${errorText}`);
    }

    const n8nResult = await n8nResponse.json();

    if (!n8nResult.success) {
      throw new Error(n8nResult.error || 'n8n generation failed');
    }

    const generationTime = ((Date.now() - startTime) / 1000).toFixed(2);

    const localResultUrl = await saveResultImage(n8nResult.result_image_url, sessionId);
    const fullResultUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${localResultUrl}`;

    const qrCode = await QRCode.toDataURL(fullResultUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#7C3AED', light: '#FFFFFF' }
    });

    // ✅ FIXED: Insert sesuai struktur table (tanpa BMI atau dengan BMI)
    let dbSaved = false;
    try {
      // Try dengan BMI first (jika kolom sudah ditambah)
      let subjectDetailId;
      try {
        const result = await query(
          `INSERT INTO subject_details 
           (session_id, tinggi_cm, berat_kg, bmi, body_type, age_range, photo_url) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [sessionId, parseInt(tinggi), parseInt(berat), parseFloat(bmi), bodyType, ageRange, fullSubjectUrl]
        );
        subjectDetailId = result.insertId;
      } catch (bmiError) {
        // Fallback: tanpa BMI
        console.log('BMI column not found, using fallback');
        const result = await query(
          `INSERT INTO subject_details 
           (session_id, tinggi_cm, berat_kg, body_type, age_range, photo_url) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [sessionId, parseInt(tinggi), parseInt(berat), bodyType, ageRange, fullSubjectUrl]
        );
        subjectDetailId = result.insertId;
      }

      await query(
        `INSERT INTO try_on_history 
         (session_id, foto_subjek_url, foto_pakaian_url, foto_hasil, qr_code,
          kategori_pakaian, crop_area, subject_detail_id, generation_time_seconds, metadata) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionId, fullSubjectUrl, fullGarmentUrl, fullResultUrl, qrCode,
          category.value, category.crop, subjectDetailId, parseFloat(generationTime),
          JSON.stringify({
            ai_model: n8nResult.ai_model || 'unknown',
            n8n_workflow_id: n8nResult.workflow_id || null,
            prompt: n8nResult.prompt || null,
            bmi: parseFloat(bmi)
          })
        ]
      );
      dbSaved = true;
      console.log('DB saved:', { sessionId, subjectDetailId });
    } catch (dbError) {
      console.error('DB save failed (non-critical):', dbError.message);
    }

    return NextResponse.json({
      success: true,
      sessionId,
      imageUrl: localResultUrl,
      qrCode,
      generationTime: `${generationTime}s`,
      dbSaved,
      metadata: {
        ai_model: n8nResult.ai_model,
        prompt: n8nResult.prompt
      }
    });

  } catch (error) {
    console.error('Generate try-on error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
*/
async function saveResultImage(imageUrlOrBase64, sessionId) {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'results');
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${sessionId}_result.jpg`;
  const filepath = path.join(uploadsDir, filename);

  if (imageUrlOrBase64.startsWith('data:image')) {
    const base64Data = imageUrlOrBase64.replace(/^data:image\/\w+;base64,/, '');
    await writeFile(filepath, Buffer.from(base64Data, 'base64'));
  } else {
    const response = await fetch(imageUrlOrBase64);
    if (!response.ok) throw new Error(`Failed to download result: ${response.status}`);
    await writeFile(filepath, Buffer.from(await response.arrayBuffer()));
  }

  return `/uploads/results/${filename}`;
}

async function uploadTempImage(base64Image, filename) {
  const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'temp');
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, `${filename}.jpg`), buffer);
  return `/uploads/temp/${filename}.jpg`;
}
