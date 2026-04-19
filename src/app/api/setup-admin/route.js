import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export const runtime = 'nodejs';

export async function GET(req) {
    try {
        await connectDB();
        
        const email = 'admin@vionara.com';
        const password = 'admin'; // Easy default password

        // Check if admin exists
        let user = await User.findOne({ email });

        if (user) {
            // Update password and ensure role is admin
            user.password = await bcrypt.hash(password, 12);
            user.role = 'admin';
            user.isActive = true;
            await user.save();
            return NextResponse.json({ 
                success: true, 
                message: 'Admin account updated.',
                credentials: { id: email, password: password } 
            });
        } else {
            // Create a brand new admin user
            const hashedPassword = await bcrypt.hash(password, 12);
            user = await User.create({
                name: 'System Admin',
                email: email,
                password: hashedPassword,
                role: 'admin',
                isActive: true
            });
            return NextResponse.json({ 
                success: true, 
                message: 'Admin account created.',
                credentials: { id: email, password: password } 
            });
        }
    } catch (error) {
        console.error('Setup Admin Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
