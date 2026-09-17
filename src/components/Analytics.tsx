'use client';

import { usePathname } from 'next/navigation';
import { GoogleAnalytics } from '@next/third-parties/google';

export default function Analytics({ gaId }: { gaId: string }) {
    const pathname = usePathname();
    if (pathname?.startsWith('/admin')) return null;
    return <GoogleAnalytics gaId={gaId} />;
}
