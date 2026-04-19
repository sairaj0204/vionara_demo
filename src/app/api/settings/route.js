import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { DEFAULT_SETTINGS, hasMongoConfig } from '@/lib/settings';
import Setting from '@/models/Setting';

const parseKeys = (searchParams) => {
  const raw = searchParams.get('keys');
  if (!raw) return [];

  return raw
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);
};

const pickSettings = (settings, keys) => {
  if (!keys.length) return settings;

  return keys.reduce((acc, key) => {
    if (key in settings) {
      acc[key] = settings[key];
    }
    return acc;
  }, {});
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const keys = parseKeys(searchParams);

  if (!hasMongoConfig()) {
    return NextResponse.json({
      success: true,
      settings: pickSettings(DEFAULT_SETTINGS, keys),
      fallback: true,
      message: 'Using default settings because MONGODB_URI is not configured.',
    });
  }

  try {
    await connectDB();

    const query = keys.length ? { key: { $in: keys } } : {};
    const storedSettings = await Setting.find(query).lean();

    const mergedSettings = { ...DEFAULT_SETTINGS };
    for (const entry of storedSettings) {
      mergedSettings[entry.key] = entry.value;
    }

    return NextResponse.json({
      success: true,
      settings: pickSettings(mergedSettings, keys),
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      settings: pickSettings(DEFAULT_SETTINGS, keys),
      fallback: true,
      message: error.message,
    });
  }
}

export async function POST(req) {
  if (!hasMongoConfig()) {
    return NextResponse.json(
      { success: false, message: 'MONGODB_URI is required to save settings.' },
      { status: 503 }
    );
  }

  try {
    await connectDB();

    const payload = await req.json();
    const entries = Object.entries(payload || {});

    if (!entries.length) {
      return NextResponse.json(
        { success: false, message: 'No settings payload provided.' },
        { status: 400 }
      );
    }

    await Promise.all(
      entries.map(([key, value]) =>
        Setting.findOneAndUpdate(
          { key },
          { key, value },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        )
      )
    );

    return NextResponse.json({ success: true, settings: payload });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
