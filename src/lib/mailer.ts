import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';

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
