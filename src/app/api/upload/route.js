import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const images = formData.getAll('images');

    if (!images || images.length === 0) {
      return NextResponse.json({ success: false, message: 'No images provided' }, { status: 400 });
    }

    const uploadPromises = images.map(async (image) => {
      // image is a File object since Next.js formData() handles multipart
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'vionara_products',
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(buffer);
      });
    });

    const results = await Promise.all(uploadPromises);

    const urls = results.map(r => r.secure_url);
    const mappedResults = results.map(r => ({
      url: r.secure_url,
      public_id: r.public_id
    }));

    return NextResponse.json({
      success: true,
      urls,
      results: mappedResults
    });

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload images', error: error.message },
      { status: 500 }
    );
  }
}
