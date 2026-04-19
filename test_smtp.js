require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTP() {
    console.log("Checking SMTP config...");
    console.log("SMTP_HOST:", process.env.SMTP_HOST);
    console.log("SMTP_PORT:", process.env.SMTP_PORT);
    console.log("SMTP_USER:", process.env.SMTP_USER);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT || 587) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        console.log("Verifying connection...");
        await transporter.verify();
        console.log("✅ Connection verified!");
        
        console.log("Sending test email...");
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.SMTP_USER,
            to: process.env.SMTP_USER,
            subject: 'Vionara SMTP Test',
            text: 'It works!',
        });
        console.log("✅ Email sent! Message ID:", info.messageId);
    } catch (err) {
        console.error("❌ SMTP Error:", err);
    }
}
testSMTP();
