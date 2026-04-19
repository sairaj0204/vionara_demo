import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { DEFAULT_THEME, hasMongoConfig } from '@/lib/settings';
import Setting from '@/models/Setting';

const THEME_KEY = 'theme';

export async function GET() {
  if (!hasMongoConfig()) {
    return NextResponse.json({
      success: true,
      theme: DEFAULT_THEME,
      fallback: true,
      message: 'Using default theme because MONGODB_URI is not configured.',
    });
  }

  try {
    await connectDB();
    const themeSetting = await Setting.findOne({ key: THEME_KEY }).lean();

    return NextResponse.json({
      success: true,
      theme: themeSetting?.value || DEFAULT_THEME,
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      theme: DEFAULT_THEME,
      fallback: true,
      message: error.message,
    });
  }
}

export async function POST(req) {
  if (!hasMongoConfig()) {
    return NextResponse.json(
      { success: false, message: 'MONGODB_URI is required to save theme settings.' },
      { status: 503 }
    );
  }

  try {
    await connectDB();
    const theme = await req.json();

    await Setting.findOneAndUpdate(
      { key: THEME_KEY },
      { key: THEME_KEY, value: theme },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, theme });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
