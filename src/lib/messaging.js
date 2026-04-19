import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// ─── Driver selection ─────────────────────────────────────────────────────────
// Priority 1: Resend (HTTP API — works on Vercel/serverless, no port issues)
// Priority 2: Gmail SMTP (local dev / self-hosted only — port 587 + STARTTLS)

function hasResendConfig() {
    const key = process.env.RESEND_API_KEY || '';
    return key.length > 10 && key.startsWith('re_') && !key.includes('YOUR_RESEND');
}

function hasGmailConfig() {
    const user = (process.env.SMTP_USER || '').trim();
    const pass = (process.env.SMTP_PASS || '').replace(/\s/g, ''); // strip any spaces
    return user.length > 0 && pass.length >= 16;
}

// ─── Resend ───────────────────────────────────────────────────────────────────
async function sendViaResend({ from, to, subject, html }) {
    console.log(`[Email/Resend] Sending to ${to}…`);
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({ from, to, subject, html });
    if (error) throw new Error(`Resend: ${error.message}`);
    console.log(`[Email/Resend] ✓ Sent — id: ${data?.id}`);
    return { messageId: data?.id };
}

// ─── Gmail SMTP (service shorthand — nodemailer handles all Gmail config) ─────
async function sendViaGmail({ from, to, subject, html }) {
    // Strip spaces from app password — Google shows it as "xxxx xxxx xxxx xxxx"
    // but SMTP auth needs it without spaces
    const user = (process.env.SMTP_USER || '').trim();
    const pass = (process.env.SMTP_PASS || '').replace(/\s/g, '');

    console.log(`[Email/SMTP] user=${user} pass_length=${pass.length} sending to ${to}…`);

    if (pass.length < 16) {
        throw new Error(
            `SMTP_PASS looks wrong (length=${pass.length}, need 16). ` +
            `Generate a Gmail App Password at myaccount.google.com/apppasswords ` +
            `and set it WITHOUT spaces.`
        );
    }

    // Use nodemailer's built-in 'gmail' service — handles host/port/TLS automatically
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        connectionTimeout: 10000,  // 10s connect timeout
        greetingTimeout: 10000,    // 10s greeting timeout
        socketTimeout: 15000,      // 15s socket timeout
    });

    // Skip transport.verify() — it adds 2-3s latency per send and throws
    // on transient network issues. sendMail() will surface auth errors directly.
    const info = await transport.sendMail({ from, to, subject, html });
    console.log(`[Email/SMTP] ✓ Sent — messageId: ${info.messageId}`);
    return { messageId: info.messageId };
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────
export async function dispatch({ from, to, subject, html }) {
    if (hasResendConfig()) {
        return sendViaResend({ from, to, subject, html });
    }
    if (hasGmailConfig()) {
        return sendViaGmail({ from, to, subject, html });
    }
    throw new Error(
        'No email provider configured. ' +
        'Option A (production): set RESEND_API_KEY in Vercel → Settings → Environment Variables. ' +
        'Option B (local): set SMTP_USER and SMTP_PASS (Gmail App Password, no spaces) in .env.'
    );
}

// ─── OTP HTML ─────────────────────────────────────────────────────────────────
function buildOtpHtml({ greetingName, actionLabel, otp }) {
    return `
    <div style="font-family:Arial,sans-serif;background:#0b0b0b;padding:40px 20px;color:#fff;">
      <div style="max-width:500px;margin:0 auto;background:#141414;padding:40px;border-radius:12px;border:1px solid #C9A34E;text-align:center;">
        <h1 style="color:#C9A34E;font-size:28px;margin:0;letter-spacing:4px;">VIONARA</h1>
        <p style="color:#888;font-size:12px;margin-top:5px;margin-bottom:30px;letter-spacing:2px;">LUXURY JEWELLERY</p>
        <p style="font-size:16px;color:#f0f0f0;">Dear ${greetingName},</p>
        <p style="font-size:14px;color:#a0a0a0;line-height:1.5;margin-bottom:30px;">
          Use the following One-Time Password to ${actionLabel}.
        </p>
        <div style="background:#0b0b0b;border:2px solid #C9A34E;border-radius:8px;padding:20px;margin:0 auto;max-width:260px;">
          <span style="font-size:36px;font-weight:bold;color:#C9A34E;letter-spacing:10px;display:block;">${otp}</span>
        </div>
        <p style="font-size:13px;color:#777;margin-top:30px;">
          Expires in <strong>5 minutes</strong>. Do not share this code.
        </p>
      </div>
    </div>`;
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function sendVerificationCode({ recipient, otp, name, purpose = 'signup' }) {
    const greetingName = name?.trim() || 'there';
    let actionLabel = 'complete your account signup';
    if (purpose === 'login') actionLabel = 'complete your login';
    if (purpose === 'forgot-password' || purpose === 'reset-password') actionLabel = 'reset your password';

    const from = (process.env.EMAIL_FROM || '').trim() ||
        `Vionara <${(process.env.SMTP_USER || 'no-reply@vionara.com').trim()}>`;

    try {
        console.log(`[OTP] Dispatching to ${recipient} (purpose: ${purpose})…`);
        return await dispatch({
            from,
            to: recipient,
            subject: 'Your Vionara verification code',
            html: buildOtpHtml({ greetingName, actionLabel, otp }),
        });
    } catch (err) {
        console.error(`[Email/OTP] FAILED for ${recipient}: ${err.message}`);
        // If it's an auth error and we're using Gmail, provide a helpful hint
        if (err.message.includes('auth') && hasGmailConfig()) {
            throw new Error(`Email authentication failed. Please check your SMTP_PASS (Gmail App Password).`);
        }
        throw new Error(`Failed to send verification email. Please try again in a moment.`);
    }
}

export async function sendPasswordResetEmail({ to, resetUrl, name }) {
    const greetingName = name?.trim() || 'there';
    const from = (process.env.EMAIL_FROM || '').trim() ||
        `Vionara <${(process.env.SMTP_USER || 'no-reply@vionara.com').trim()}>`;

    await dispatch({
        from,
        to,
        subject: 'Reset your Vionara password',
        html: `
        <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:24px;color:#1f1f1f;">
          <p style="font-size:14px;color:#7b7b7b;letter-spacing:.08em;text-transform:uppercase;margin:0 0 12px;">Vionara</p>
          <h1 style="font-size:28px;margin:0 0 16px;">Reset your password</h1>
          <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">Hello ${greetingName}, click below to set a new password:</p>
          <a href="${resetUrl}" style="display:inline-block;background:#121212;color:#fff;padding:14px 36px;text-decoration:none;font-size:14px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;">Reset Password</a>
          <p style="font-size:13px;line-height:1.7;margin:24px 0 0;color:#999;">
            Link expires in 15 minutes. If you didn't request this, ignore this email.
          </p>
        </div>`,
    });
}
