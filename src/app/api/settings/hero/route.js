import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { DEFAULT_HERO_SLIDES } from '@/lib/heroSlides';
import Setting from '@/models/Setting';

const HERO_KEY = 'heroSlides';

export async function GET() {
  try {
    await connectDB();

    const heroSetting = await Setting.findOne({ key: HERO_KEY }).lean();
    const heroSlides =
      Array.isArray(heroSetting?.value) && heroSetting.value.length > 0
        ? heroSetting.value
        : DEFAULT_HERO_SLIDES;

    return NextResponse.json({ success: true, heroSlides });
  } catch (error) {
    return NextResponse.json({
      success: true,
      heroSlides: DEFAULT_HERO_SLIDES,
      fallback: true,
      message: error.message,
    });
  }
}

export async function PUT(req) {
  try {
    await connectDB();

    const { heroSlides } = await req.json();

    if (!Array.isArray(heroSlides) || heroSlides.length === 0) {
      return NextResponse.json(
        { success: false, message: 'heroSlides must be a non-empty array' },
        { status: 400 }
      );
    }

    const sanitizedSlides = heroSlides.map((slide, index) => ({
      id: slide.id || `hero-${index + 1}`,
      image: slide.image || DEFAULT_HERO_SLIDES[index % DEFAULT_HERO_SLIDES.length].image,
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      buttonText: slide.buttonText || 'Shop Now',
      buttonLink: slide.buttonLink || '/shop',
    }));

    await Setting.findOneAndUpdate(
      { key: HERO_KEY },
      { key: HERO_KEY, value: sanitizedSlides },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, heroSlides: sanitizedSlides });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
