import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import logo from "../assets/logo.jpg";
import { useLang } from '@/i18n/LangProvider';
import type { Lang } from '../types';

function LangToggle() {
    const { lang, setLang } = useLang();

    return (
        <div className="flex items-center gap-0.5 p-[3px] bg-[rgba(26,111,208,0.1)] border border-[rgba(26,111,208,0.2)] rounded-[10px]">
            {(['VI', 'EN'] as Lang[]).map(l => (
                <button
                    type="button"
                    key={l}
                    onClick={() => setLang(l)}
                    className={`py-[5px] px-3 rounded-[7px] border-none font-semibold text-[13px] cursor-pointer transition-[background-color,color] duration-[180ms] ${
                        lang === l ? 'bg-primary text-white' : 'bg-transparent text-primary'
                    }`}
                >
                    {l}
                </button>
            ))}
        </div>
    );
}

interface NavLinkProps {
    href: string;
    active: boolean;
    children: React.ReactNode;
}

function NavLink({ href, active, children }: NavLinkProps) {
    return (
        <Link
            href={href}
            className={`text-[13px] no-underline whitespace-nowrap transition-colors duration-[180ms] ${
                active ? 'font-bold text-primary' : 'font-medium text-text-dim hover:text-primary'
            }`}
        >
            {children}
        </Link>
    );
}

interface SheetLinkProps extends NavLinkProps {
    onNavigate: () => void;
}

function SheetLink({ href, active, onNavigate, children }: SheetLinkProps) {
    return (
        <Link
            href={href}
            onClick={onNavigate}
            className={`flex items-center justify-between gap-3 min-h-[52px] px-3 rounded-[12px] text-[15px] no-underline transition-colors duration-[180ms] ${
                active ? 'font-bold text-primary bg-[rgba(26,111,208,0.1)]' : 'font-medium text-text-dim'
            }`}
        >
            <span>{children}</span>
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true" className="shrink-0 opacity-50">
                <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </Link>
    );
}

function Navbar() {
    const { t, fixed } = useLang();
    const [navOpen, setNavOpen] = useState<boolean>(false);
    const pathname = usePathname();

    useEffect(() => {
        const mq = window.matchMedia('(width >= 901px)');
        function closeIfWide(): void { if (mq.matches) setNavOpen(false); }
        mq.addEventListener('change', closeIfWide);
        return () => mq.removeEventListener('change', closeIfWide);
    }, []);

    useEffect(() => {
        document.body.style.overflow = navOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [navOpen]);

    return (
        <nav className="sticky top-0 z-40 bg-sky border-b border-border">
            <div className="py-3.5 px-5 grid grid-cols-[auto_1fr_auto] items-center gap-4 nav:px-10">
                {/* Logo + wordmark */}
                <div className="col-start-1 flex items-center gap-2.5">
                    <img
                        src={logo.src}
                        alt="ECS Finder logo"
                        className="w-11 h-11 rounded-[11px] object-cover border border-border"
                    />
                    <span className="font-heading font-bold text-[18px] tracking-[-0.01em] text-text">ECS Finder</span>
                </div>

                {/* Desktop: nav links, centered */}
                <div className="col-start-2 hidden nav:flex items-center justify-center gap-6">
                    <NavLink href="/" active={pathname === '/'}>{t('nav.home')}</NavLink>
                    <NavLink href="/submit" active={pathname === '/submit'}>{t('nav.submit')}</NavLink>
                </div>

                {/* Desktop: lang toggle */}
                <div className="col-start-3 hidden nav:flex items-center justify-self-end">
                    {!fixed && <LangToggle />}
                </div>

                {/* Mobile: hamburger, shares the third grid cell with the lang toggle above */}
                <button
                    type="button"
                    onClick={() => setNavOpen(o => !o)}
                    aria-label={navOpen ? t('nav.closeMenu') : t('nav.openMenu')}
                    className={`col-start-3 justify-self-end hidden max-nav:flex h-10 items-center gap-2 pl-3 pr-3.5 rounded-[10px] border cursor-pointer shrink-0 text-white shadow-[0_3px_10px_rgba(26,111,208,0.28)] transition-colors duration-200 ${
                        navOpen ? 'bg-primary-2 border-primary-2' : 'bg-primary border-primary'
                    }`}
                >
                    <span aria-hidden="true" className="flex flex-col items-center gap-[5px]">
                        <span className={`block w-[18px] h-[1.5px] bg-white rounded-full transition-[transform,opacity] duration-200 ${
                            navOpen ? 'translate-y-[6.5px] rotate-45' : ''
                        }`} />
                        <span className={`block w-[18px] h-[1.5px] bg-white rounded-full transition-opacity duration-200 ${
                            navOpen ? 'opacity-0' : 'opacity-100'
                        }`} />
                        <span className={`block w-[18px] h-[1.5px] bg-white rounded-full transition-[transform,opacity] duration-200 ${
                            navOpen ? '-translate-y-[6.5px] -rotate-45' : ''
                        }`} />
                    </span>
                    <span className="font-semibold text-[13px] leading-none">{t('nav.menu')}</span>
                </button>
            </div>

            {/* Mobile: bottom sheet. The scrim is structural, so tapping outside closes it. */}
            {navOpen && (
                <div
                    className="hidden max-nav:flex fixed inset-0 z-[100] flex-col justify-end bg-[rgba(18,40,62,0.5)]"
                    onClick={() => setNavOpen(false)}
                >
                    <div
                        className="flex flex-col bg-glass rounded-t-[22px] animate-sheet-up pb-[max(18px,env(safe-area-inset-bottom))]"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-9 h-1 rounded-full bg-[rgba(20,52,80,0.18)]" />
                        </div>

                        {/* Header */}
                        <div className="pt-2 px-5 pb-3 border-b border-border">
                            <span className="font-heading font-bold text-[16px] text-text">{t('nav.menu')}</span>
                        </div>

                        {/* Links. Closing here rather than in an effect on pathname:
                            Navbar survives client-side navigation, so nothing else resets navOpen. */}
                        <div className="flex flex-col gap-1 px-3 py-2.5">
                            <SheetLink href="/" active={pathname === '/'} onNavigate={() => setNavOpen(false)}>{t('nav.home')}</SheetLink>
                            <SheetLink href="/submit" active={pathname === '/submit'} onNavigate={() => setNavOpen(false)}>{t('nav.submit')}</SheetLink>
                        </div>

                        {!fixed && (
                            <div className="flex items-center justify-between gap-3 mx-5 pt-3.5 border-t border-border">
                                <span className="text-[13.5px] font-medium text-text-faint">{t('nav.language')}</span>
                                <LangToggle />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
