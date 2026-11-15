import { NextResponse } from 'next/server';
import db from '@/lib/db';
import QRCode from 'qrcode';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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

    // Save uploaded images to temp folder
    const subjectUrl = await uploadTempImage(subjectPhoto, `${sessionId}_subject`);
    const garmentUrl = await uploadTempImage(garmentPhoto, `${sessionId}_garment`);

    const fullSubjectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${subjectUrl}`;
    const fullGarmentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${garmentUrl}`;

    console.log('Sending to n8n webhook:', { sessionId });

    // Call n8n webhook
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
    console.log('n8n response received:', {
      success: n8nResult.success,
      ai_model: n8nResult.ai_model,
      generation_time: n8nResult.generation_time_seconds
    });

    if (!n8nResult.success) {
      throw new Error(n8nResult.error || 'n8n generation failed');
    }

    const generationTime = ((Date.now() - startTime) / 1000).toFixed(2);

    // ✅ FIX: Handle both base64 data URL and HTTP URL
    const localResultUrl = await saveResultImage(n8nResult.result_image_url, sessionId);
    const fullResultUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${localResultUrl}`;

    // Generate QR code
    const qrCode = await QRCode.toDataURL(fullResultUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#7C3AED',
        light: '#FFFFFF'
      }
    });

    // Save to database
    const subjectDetailId = await saveSubjectDetails(db, {
      sessionId,
      tinggi: parseInt(tinggi),
      berat: parseInt(berat),
      bodyType,
      ageRange,
      photoUrl: fullSubjectUrl,
      bmi: parseFloat(bmi)
    });

    await saveTryOnHistory(db, {
      sessionId,
      fotoSubjekUrl: fullSubjectUrl,
      fotoPakaianUrl: fullGarmentUrl,
      fotoHasil: fullResultUrl,
      qrCode,
      kategoriPakaian: category.value,
      cropArea: category.crop,
      subjectDetailId,
      generationTime: parseFloat(generationTime),
      metadata: JSON.stringify({
        ai_model: n8nResult.ai_model || 'unknown',
        n8n_workflow_id: n8nResult.workflow_id || null,
        prompt: n8nResult.prompt || null
      })
    });

    return NextResponse.json({
      success: true,
      sessionId,
      imageUrl: localResultUrl,
      qrCode,
      generationTime: `${generationTime}s`,
      metadata: {
        ai_model: n8nResult.ai_model,
        prompt: n8nResult.prompt
      }
    });

  } catch (error) {
    console.error('Generate try-on error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        details: error.stack || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ✅ FIX: Handle BOTH base64 data URL AND HTTP URL
async function saveResultImage(imageUrlOrBase64, sessionId) {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'results');
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${sessionId}_result.jpg`;
  const filepath = path.join(uploadsDir, filename);

  if (imageUrlOrBase64.startsWith('data:image')) {
    // ✅ n8n returned base64 data URL
    const base64Data = imageUrlOrBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    await writeFile(filepath, buffer);
  } else {
    // ✅ n8n returned HTTP URL (fal.ai, Replicate, etc.)
    const response = await fetch(imageUrlOrBase64);
    if (!response.ok) throw new Error(`Failed to download result image: ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(filepath, buffer);
  }

  return `/uploads/results/${filename}`;
}

async function uploadTempImage(base64Image, filename) {
  const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'temp');
  await mkdir(uploadsDir, { recursive: true });

  const filepath = path.join(uploadsDir, `${filename}.jpg`);
  await writeFile(filepath, buffer);

  return `/uploads/temp/${filename}.jpg`;
}

async function saveSubjectDetails(db, data) {
  const [result] = await db.execute(
    `INSERT INTO subject_details 
     (session_id, tinggi_cm, berat_kg, body_type, age_range, photo_url, bmi) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.sessionId, data.tinggi, data.berat, data.bodyType, data.ageRange, data.photoUrl, data.bmi]
  );
  return result.insertId;
}

async function saveTryOnHistory(db, data) {
  await db.execute(
    `INSERT INTO try_on_history 
     (session_id, foto_subjek_url, foto_pakaian_url, foto_hasil, qr_code, 
      kategori_pakaian, crop_area, subject_detail_id, generation_time_seconds, metadata) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.sessionId,
      data.fotoSubjekUrl,
      data.fotoPakaianUrl,
      data.fotoHasil,
      data.qrCode,
      data.kategoriPakaian,
      data.cropArea,
      data.subjectDetailId,
      data.generationTime,
      data.metadata
    ]
  );
}
