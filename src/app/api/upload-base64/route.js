import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const { image, key } = await req.json();

    if (!image || !image.startsWith('data:image/')) {
      return NextResponse.json({ success: false, message: 'Invalid image format' }, { status: 400 });
    }

    // Extract base64 data and file extension
    const matches = image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ success: false, message: 'Invalid base64 string' }, { status: 400 });
    }

    const extension = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Make sure the uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `img_${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
    const filePath = path.join(uploadsDir, filename);

    // Save file
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, url: publicUrl, key });
  } catch (error) {
    console.error('Error saving image:', error);
    return NextResponse.json({ success: false, message: 'Server error saving image' }, { status: 500 });
  }
}
