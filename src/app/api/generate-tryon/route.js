import { NextResponse } from 'next/server';
import db from '@/lib/db';
import * as fal from '@fal-ai/serverless-client';
import QRCode from 'qrcode';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Configure fal.ai
fal.config({
  credentials: process.env.FAL_API_KEY,
});

export async function POST(request) {
  try {
    const {
      subjectPhoto,    // Base64 image
      tinggi,
      berat,
      bodyType,
      ageRange,
      garmentPhoto,    // Base64 image
      category
    } = await request.json();

    // Validate
    if (!subjectPhoto || !garmentPhoto || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sessionId = `tryon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    // Calculate BMI
    const tinggiM = tinggi / 100;
    const bmi = (berat / (tinggiM * tinggiM)).toFixed(1);

    // Build prompt
    const prompt = buildPrompt(category, bodyType, bmi, tinggi);

    console.log('Starting generation:', { sessionId, prompt });

    // Upload images to temporary storage (fal.ai needs URLs, not base64)
    const subjectUrl = await uploadTempImage(subjectPhoto, `${sessionId}_subject`);
    const garmentUrl = await uploadTempImage(garmentPhoto, `${sessionId}_garment`);

    // Call fal.ai Virtual Try-On
    const result = await fal.subscribe('fal-ai/idm-vton', {
      input: {
        human_img: subjectUrl,
        garm_img: garmentUrl,
        garment_des: prompt,
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log('Queue update:', update);
      },
    });

    const generationTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('Generation complete:', { generationTime, result });

    // Save result image
    const resultImageUrl = result.image.url;
    const localResultUrl = await downloadAndSave(resultImageUrl, sessionId);

    // Generate QR code
    const qrCode = await QRCode.toDataURL(
      `${process.env.NEXT_PUBLIC_SITE_URL}${localResultUrl}`,
      { width: 300, margin: 2 }
    );

    // Save to database
    const subjectDetailId = await saveSubjectDetails(db, {
      sessionId,
      tinggi,
      berat,
      bodyType,
      ageRange,
      photoUrl: subjectUrl,
      bmi
    });

    await saveTryOnHistory(db, {
      sessionId,
      fotoSubjekUrl: subjectUrl,
      fotoPakaianUrl: garmentUrl,
      fotoHasil: localResultUrl,
      qrCode,
      kategoriPakaian: category.value,
      cropArea: category.crop,
      subjectDetailId,
      generationTime
    });

    return NextResponse.json({
      success: true,
      sessionId,
      imageUrl: localResultUrl,
      qrCode,
      generationTime: `${generationTime}s`
    });

  } catch (error) {
    console.error('Generate try-on error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate virtual try-on' },
      { status: 500 }
    );
  }
}

// Helper: Build AI prompt
function buildPrompt(category, bodyType, bmi, tinggi) {
  const bodyDesc = {
    petite: 'petite body, small frame',
    slim: 'slim and slender body',
    average: 'average body proportions',
    curvy: 'curvy body with defined waist',
    plus_size: 'plus size body, fuller figure'
  };

  const cropDesc = {
    half_body: 'upper body view',
    three_quarter: 'three-quarter body view',
    full_body: 'full body view'
  };

  return `${cropDesc[category.crop]}, Indonesian woman, ${bodyDesc[bodyType]}, height ${tinggi}cm, BMI ${bmi}, professional fashion photography, studio lighting, white background`;
}

// Helper: Upload temp image (convert base64 to URL)
async function uploadTempImage(base64Image, filename) {
  const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'temp');
  
  await mkdir(uploadsDir, { recursive: true });
  
  const filepath = path.join(uploadsDir, `${filename}.jpg`);
  await writeFile(filepath, buffer);
  
  return `/uploads/temp/${filename}.jpg`;
}

// Helper: Download and save result
async function downloadAndSave(url, sessionId) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'results');
  await mkdir(uploadsDir, { recursive: true });
  
  const filename = `${sessionId}_result.jpg`;
  const filepath = path.join(uploadsDir, filename);
  await writeFile(filepath, Buffer.from(buffer));
  
  return `/uploads/results/${filename}`;
}

// Helper: Save subject details to DB
async function saveSubjectDetails(db, data) {
  const [result] = await db.execute(
    `INSERT INTO subject_details 
     (session_id, tinggi_cm, berat_kg, body_type, age_range, photo_url, bmi) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.sessionId, data.tinggi, data.berat, data.bodyType, data.ageRange, data.photoUrl, data.bmi]
  );
  
  return result.insertId;
}

// Helper: Save try-on history
async function saveTryOnHistory(db, data) {
  await db.execute(
    `INSERT INTO try_on_history 
     (session_id, foto_subjek_url, foto_pakaian_url, foto_hasil, qr_code, kategori_pakaian, crop_area, subject_detail_id, generation_time_seconds) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.sessionId,
      data.fotoSubjekUrl,
      data.fotoPakaianUrl,
      data.fotoHasil,
      data.qrCode,
      data.kategoriPakaian,
      data.cropArea,
      data.subjectDetailId,
      data.generationTime
    ]
  );
}
