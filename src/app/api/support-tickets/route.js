import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { connectDB } from '@/lib/db';
import SupportTicket from '@/models/SupportTicket';

export const runtime = 'nodejs';

// POST /api/support-tickets — create a new support ticket
export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();

        const { name, email, phone, category, subject, message, orderNumber } = body;

        // Basic validation
        if (!name?.trim() || !email?.trim() || !category || !subject?.trim() || !message?.trim()) {
            return NextResponse.json(
                { success: false, message: 'Please fill in all required fields.' },
                { status: 400 }
            );
        }

        const ticketNumber = `VIO-${randomBytes(3).toString('hex').toUpperCase()}`;

        const ticket = await SupportTicket.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone?.trim() || '',
            category,
            subject: subject.trim(),
            message: message.trim(),
            orderNumber: orderNumber?.trim() || '',
            ticketNumber,
        });

        return NextResponse.json({
            success: true,
            ticketNumber: ticket.ticketNumber,
            message: `Your support ticket #${ticket.ticketNumber} has been submitted. We'll get back to you within 24–48 hours.`,
        });
    } catch (error) {
        console.error('[Support Ticket] POST error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to submit ticket.' },
            { status: 500 }
        );
    }
}

// GET /api/support-tickets?email=... — fetch tickets by email (for user to check status)
export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const email = (searchParams.get('email') || '').trim().toLowerCase();

        if (!email) {
            return NextResponse.json({ success: false, message: 'Email is required.' }, { status: 400 });
        }

        const tickets = await SupportTicket.find({ email })
            .select('ticketNumber category subject status createdAt')
            .sort({ createdAt: -1 })
            .limit(20);

        return NextResponse.json({ success: true, tickets });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to fetch tickets.' },
            { status: 500 }
        );
    }
}
