'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { GoogleAnalytics } from '@next/third-parties/google';
import { useLang } from '@/i18n/LangProvider';

const STORAGE_KEY = 'ecs-analytics-consent';

type Consent = 'granted' | 'denied' | 'unknown';

export default function Analytics({ gaId }: { gaId: string }) {
    const pathname = usePathname();
    const { t } = useLang();
    const [consent, setConsent] = useState<Consent | null>(null);

    useEffect(() => {
        let stored: string | null = null;
        try {
            stored = localStorage.getItem(STORAGE_KEY);
        } catch {
            stored = null;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage only exists after hydration; reading it during render would desync server and client HTML
        setConsent(stored === 'granted' || stored === 'denied' ? stored : 'unknown');
    }, []);

    function choose(value: 'granted' | 'denied'): void {
        setConsent(value);
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch {
            // Safari private mode throws; the choice still holds for this page view.
        }
    }

    if (pathname?.startsWith('/admin')) return null;

    return (
        <>
            {consent === 'granted' && <GoogleAnalytics gaId={gaId} />}

            {consent === 'unknown' && (
                <div
                    role="dialog"
                    aria-label={t('consent.title')}
                    className="fixed z-[60] left-4 right-4 bottom-4 mx-auto max-w-[520px] bg-glass border border-border rounded-2xl shadow-[0_18px_40px_rgba(20,44,68,0.22)] p-4 flex flex-col gap-3 animate-[fadeUp_0.4s_cubic-bezier(0.16,1,0.3,1)_both]"
                >
                    <p className="text-[13px] leading-[1.6] text-text-dim m-0">
                        {t('consent.body')}{' '}
                        <Link href="/privacy" className="text-primary underline">
                            {t('footer.privacy')}
                        </Link>
                    </p>

                    <div className="flex gap-2.5 flex-wrap">
                        <button
                            type="button"
                            onClick={() => choose('granted')}
                            className="bg-primary text-white rounded-[12px] py-2 px-4 font-semibold text-[13.5px] cursor-pointer"
                        >
                            {t('consent.accept')}
                        </button>
                        <button
                            type="button"
                            onClick={() => choose('denied')}
                            className="bg-glass border border-border rounded-[12px] py-2 px-4 font-semibold text-[13.5px] text-text cursor-pointer hover:border-primary transition-colors duration-150"
                        >
                            {t('consent.decline')}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
