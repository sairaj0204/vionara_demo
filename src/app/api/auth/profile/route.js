import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import User from '@/models/User';

export async function GET(req) {
    try {
        await connectDB();
        const user = await getUserFromToken();

        if (!user) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        return NextResponse.json({ success: true, user });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        const user = await getUserFromToken();

        if (!user) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        const { name, avatar } = await req.json();
        
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { name, avatar },
            { new: true }
        ).select('-password');

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
