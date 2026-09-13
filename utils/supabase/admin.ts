// Makes importing this module from the 'use client' tree a BUILD error. Without
// it, Next would silently substitute undefined for SUPABASE_SERVICE_ROLE_KEY in
// the browser bundle (it has no NEXT_PUBLIC_ prefix) and the mistake would only
// surface as a confusing runtime failure. The key would not leak either way —
// this makes the boundary enforced rather than conventional.
import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// The fourth Supabase client, and the only one that bypasses Row Level Security.
//
// Lazy so importing the module does not throw at build time without the env var.

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
    if (!cached) {
        cached = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } },
        );
    }
    return cached;
}
