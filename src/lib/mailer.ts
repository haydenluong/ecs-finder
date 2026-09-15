import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';

// Fails open: every failure path returns false and logs. A mail outage must never
// turn a saved submission or a committed approval into an error for the user.
let cached: Transporter | null = null;

function getTransport(): Transporter | null {
    if (cached) return cached;

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        console.error('Mail not configured: SMTP_HOST, SMTP_USER and SMTP_PASS are all required');
        return null;
    }

    cached = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT ?? 465),
        secure: process.env.SMTP_SECURE !== 'false',
        auth: { user, pass },
    });

    return cached;
}

export async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
    const transport = getTransport();
    if (!transport) return false;

    try {
        await transport.sendMail({
            // Gmail rewrites From to the authenticated account, so MAIL_FROM must
            // name the same mailbox as SMTP_USER or the header is silently replaced.
            from: process.env.MAIL_FROM ?? process.env.SMTP_USER!,
            to,
            subject,
            text,
        });
        return true;
    } catch (err) {
        console.error('Mail send failed:', err);
        return false;
    }
}
