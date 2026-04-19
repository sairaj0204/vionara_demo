import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { DEFAULT_NEW_ARRIVALS_BANNER, hasMongoConfig } from '@/lib/settings';
import Setting from '@/models/Setting';

const BANNER_KEY = 'new-arrivals-banner';

export async function GET() {
  if (!hasMongoConfig()) {
    return NextResponse.json({
      success: true,
      banner: DEFAULT_NEW_ARRIVALS_BANNER,
      fallback: true,
      message: 'Using default new arrivals banner because MONGODB_URI is not configured.',
    });
  }

  try {
    await connectDB();
    const bannerSetting = await Setting.findOne({ key: BANNER_KEY }).lean();

    return NextResponse.json({
      success: true,
      banner: bannerSetting?.value || DEFAULT_NEW_ARRIVALS_BANNER,
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      banner: DEFAULT_NEW_ARRIVALS_BANNER,
      fallback: true,
      message: error.message,
    });
  }
}
