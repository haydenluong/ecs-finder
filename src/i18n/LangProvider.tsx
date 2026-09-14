'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import type { Lang } from '@/types';
import { translate, type StringKey, type Vars } from './strings';

const STORAGE_KEY = 'ecs_lang';

interface LangContextValue {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: (key: StringKey, vars?: Vars) => string;
    fixed: boolean;
}

const LangContext = createContext<LangContextValue | null>(null);

export function useLang(): LangContextValue {
    const ctx = useContext(LangContext);
    if (!ctx) throw new Error('useLang must be used inside <LangProvider>');
    return ctx;
}

// /admin is pinned to Vietnamese: a reviewer has to see the literal values they
// are approving, and Navbar/PreviewCard are shared with the public pages.
function isFixedPath(pathname: string | null): boolean {
    return pathname?.startsWith('/admin') ?? false;
}

export default function LangProvider({ children }: { children: ReactNode }) {
    const fixed = isFixedPath(usePathname());
    const [stored, setStored] = useState<Lang>('VI');

    useEffect(() => {
        try {
            const saved = window.localStorage.getItem(STORAGE_KEY);
            // eslint-disable-next-line react-hooks/set-state-in-effect -- read storage only after hydration, so server and client HTML match
            if (saved === 'VI' || saved === 'EN') setStored(saved);
        } catch {
            // Private-mode Safari throws on access; the VI default already applies.
        }
    }, []);

    const lang: Lang = fixed ? 'VI' : stored;

    useEffect(() => {
        document.documentElement.lang = lang.toLowerCase();
    }, [lang]);

    const setLang = useCallback((next: Lang) => {
        setStored(next);
        try {
            window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // Not persisting is acceptable; the toggle still works for this session.
        }
    }, []);

    const value = useMemo<LangContextValue>(() => ({
        lang,
        setLang,
        fixed,
        t: (key, vars) => translate(lang, key, vars),
    }), [lang, setLang, fixed]);

    return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
