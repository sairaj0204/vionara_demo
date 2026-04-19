const nodemailer = require('nodemailer');
require('dotenv').config();

async function testConnection() {
    console.log("--- SMTP Connection Test ---");
    console.log(`Host: ${process.env.SMTP_HOST}`);
    console.log(`Port: ${process.env.SMTP_PORT}`);
    console.log(`User: ${process.env.SMTP_USER}`);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_PORT == 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        await transporter.verify();
        console.log("✅ SMTP connection is successful!");
    } catch (error) {
        console.error("❌ SMTP connection failed:");
        console.error(error);
    }
}

testConnection();
