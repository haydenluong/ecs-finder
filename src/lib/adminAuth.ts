export const ADMIN_COOKIE = 'ecs_admin_session';

const SESSION_TTL_SECONDS = 60 * 60 * 12;

const encoder = new TextEncoder();

export interface AdminSession {
    /** The approver's label from ADMIN_USERS. Recorded as reviewed_by on decided rows. */
    sub: string;
    /** Expiry, in seconds since the epoch. */
    exp: number;
}

interface Approver {
    label: string;
    password: string;
}


function getApprovers(): Approver[] {
    return (process.env.ADMIN_USERS ?? '')
        .split(',')
        .map(entry => entry.trim())
        .filter(Boolean)
        .map(entry => {
            const separator = entry.indexOf(':');
            if (separator <= 0) return null;
            return { label: entry.slice(0, separator).trim(), password: entry.slice(separator + 1) };
        })
        .filter((a): a is Approver => a !== null && a.label !== '' && a.password !== '');
}


function getSecret(): string | null {
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.length < 32) return null;
    return secret;
}


export function isAdminAuthConfigured(): boolean {
    return getSecret() !== null && getApprovers().length > 0;
}

async function hmac(secret: string, data: string): Promise<Uint8Array> {
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
    );
    return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(data)));
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
}

function toBase64Url(bytes: Uint8Array): string {
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}


function fromBase64Url(value: string): Uint8Array {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

export async function findApproverByPassword(password: string): Promise<string | null> {
    const secret = getSecret();
    if (!secret) return null;

    const given = await hmac(secret, password);
    let match: string | null = null;
    for (const approver of getApprovers()) {
        if (timingSafeEqual(given, await hmac(secret, approver.password))) {
            match = approver.label;
        }
    }
    return match;
}


export async function createSessionToken(sub: string): Promise<string | null> {
    const secret = getSecret();
    if (!secret) return null;

    const payload: AdminSession = { sub, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
    const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
    return `${body}.${toBase64Url(await hmac(secret, body))}`;
}


export async function verifySessionToken(token: string | undefined): Promise<AdminSession | null> {
    const secret = getSecret();
    if (!secret || !token) return null;

    const [body, signature] = token.split('.');
    if (!body || !signature) return null;

    let given: Uint8Array;
    try {
        given = fromBase64Url(signature);
    } catch {
        return null;
    }
    if (!timingSafeEqual(await hmac(secret, body), given)) return null;

    let payload: AdminSession;
    try {
        payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body)));
    } catch {
        return null;
    }

    if (typeof payload?.sub !== 'string' || typeof payload?.exp !== 'number') return null;
    if (payload.exp * 1000 <= Date.now()) return null;
    if (!getApprovers().some(a => a.label === payload.sub)) return null;

    return payload;
}

/** Shared by the login route (set) and logout route (clear) so the attributes cannot drift. */
export function sessionCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: SESSION_TTL_SECONDS,
    };
}
