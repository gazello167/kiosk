import { NextResponse } from 'next/server';
import db from '@/lib/db';

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

    // Validate input
    if (!subjectPhoto || !garmentPhoto || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate session ID
    const sessionId = `tryon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculate BMI for better AI prompt
    const tinggiM = tinggi / 100;
    const bmi = berat / (tinggiM * tinggiM);

    // Build prompt based on category
    const prompt = buildPrompt(category, bodyType, bmi, tinggi);

    console.log('Starting virtual try-on generation...', {
      sessionId,
      category: category.value,
      bodyType,
      tinggi,
      berat
    });

    // Call try-on API (placeholder - implement based on your chosen API)
    const tryonResult = await callTryOnAPI({
      subjectPhoto,
      garmentPhoto,
      prompt,
      cropArea: category.crop
    });

    // Upload result to R2 Cloudflare (or save to public folder temporarily)
    const imageUrl = await uploadToStorage(tryonResult.image, sessionId);

    // Generate QR code
    const qrCode = await generateQR(imageUrl);

    // Save to database
    await saveToDatabase(db, {
      sessionId,
      subjectDetails: { tinggi, berat, bodyType, ageRange },
      category: category.value,
      cropArea: category.crop,
      imageUrl,
      qrCode
    });

    return NextResponse.json({
      success: true,
      sessionId,
      imageUrl,
      qrCode
    });

  } catch (error) {
    console.error('Generate try-on error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function: Build AI prompt
function buildPrompt(category, bodyType, bmi, tinggi) {
  const bodyDesc = {
    petite: 'petite body, small frame, delicate proportions',
    slim: 'slim and slender body, lean figure',
    average: 'average body proportions, balanced figure',
    curvy: 'curvy body with defined waist, hourglass shape',
    plus_size: 'plus size body, fuller figure, confident pose'
  };

  const cropDesc = {
    half_body: 'upper body shot, from waist up, cropped at waist level, focus on top garment',
    three_quarter: 'three-quarter body shot, from head to knees, showing tunic length garment',
    full_body: 'full body shot, from head to feet, showing complete outfit from top to bottom'
  };

  return `Professional fashion photography, Indonesian woman, ${bodyDesc[bodyType]}, height ${tinggi}cm, BMI ${bmi.toFixed(1)}, ${cropDesc[category.crop]}, studio lighting, neutral white background, high quality 4K, realistic skin texture, detailed fabric texture, professional model pose, front facing, natural expression`;
}

// Helper function: Call Try-On API
async function callTryOnAPI(data) {
  // TODO: Implement based on chosen API (fal.ai, Replicate, etc)
  // For now, return mock data
  
  console.log('Calling try-on API with:', {
    prompt: data.prompt,
    cropArea: data.cropArea
  });

  // Mock implementation - replace with real API call
  // Example for fal.ai:
  /*
  const response = await fetch('https://fal.run/fal-ai/idm-vton', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${process.env.FAL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      human_img: data.subjectPhoto,
      garm_img: data.garmentPhoto,
      garment_des: data.prompt
    })
  });
  
  return await response.json();
  */

  // Mock response for testing
  return {
    image: data.subjectPhoto, // Return subject photo as placeholder
    status: 'success'
  };
}

// Helper function: Upload to storage (R2 or local)
async function uploadToStorage(imageBase64, sessionId) {
  // TODO: Implement R2 Cloudflare upload
  // For now, save to public folder
  
  const fs = require('fs');
  const path = require('path');
  
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = `${sessionId}.jpg`;
  const filepath = path.join(uploadsDir, filename);
  
  // Convert base64 to buffer and save
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(filepath, buffer);

  return `/uploads/${filename}`;
}

// Helper function: Generate QR code
async function generateQR(url) {
  const QRCode = require('qrcode');
  
  const fullUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${url}`;
  const qrCodeDataUrl = await QRCode.toDataURL(fullUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: '#7C3AED',
      light: '#FFFFFF'
    }
  });

  return qrCodeDataUrl;
}

// Helper function: Save to database
async function saveToDatabase(db, data) {
  const { sessionId, subjectDetails, category, cropArea, imageUrl, qrCode } = data;

  try {
    // Save subject details
    await db.execute(
      `INSERT INTO subject_details 
       (session_id, tinggi_cm, berat_kg, body_type, age_range, photo_url) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        sessionId,
        subjectDetails.tinggi,
        subjectDetails.berat,
        subjectDetails.bodyType,
        subjectDetails.ageRange,
        imageUrl
      ]
    );

    // Save try-on history
    await db.execute(
      `INSERT INTO try_on_history 
       (session_id, foto_hasil, qr_code, kategori_pakaian, crop_area) 
       VALUES (?, ?, ?, ?, ?)`,
      [sessionId, imageUrl, qrCode, category, cropArea]
    );

    console.log('Saved to database:', sessionId);
  } catch (error) {
    console.error('Database save error:', error);
    throw error;
  }
}
