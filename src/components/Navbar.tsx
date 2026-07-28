import { useState, useEffect } from 'react';
import logo from "../assets/logo.jpg";
import type { Lang } from '../types';

interface NavbarProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

function LangToggle({ lang, onLangChange }: NavbarProps) {
    return (
        <div className="flex items-center gap-0.5 p-[3px] bg-[rgba(26,111,208,0.1)] border border-[rgba(26,111,208,0.2)] rounded-[10px]">
            {(['VI', 'EN'] as Lang[]).map(l => (
                <button
                    type="button"
                    key={l}
                    onClick={() => l === 'VI' && onLangChange('VI')}
                    className={`py-[5px] px-3 rounded-[7px] border-none font-semibold text-[13px] transition-[background-color,color] duration-[180ms] ${
                        l === 'EN' ? 'cursor-default' : 'cursor-pointer'
                    } ${
                        lang === l ? 'bg-primary text-white' : 'bg-transparent text-primary'
                    }`}
                >
                    {l}
                </button>
            ))}
        </div>
    );
}

function CtaButton() {
    return (
        <a
            href="https://forms.gle/xfmn8WT8c93NhtzNA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-medium text-[13px] text-white bg-primary py-[11px] px-5 rounded-full no-underline whitespace-nowrap transition-transform duration-[180ms] hover:-translate-y-px"
        >
            + Đăng hoạt động
        </a>
    );
}

function Navbar({ lang, onLangChange }: NavbarProps) {
    const [navOpen, setNavOpen] = useState<boolean>(false);

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
            <div className="py-3.5 px-5 flex items-center justify-between nav:px-10">
                {/* Logo + wordmark */}
                <div className="flex items-center gap-2.5">
                    <img
                        src={logo.src}
                        alt="ECS Finder logo"
                        className="w-11 h-11 rounded-[11px] object-cover border border-border"
                    />
                    <span className="font-heading font-bold text-[18px] tracking-[-0.01em] text-text">ECS Finder</span>
                </div>

                {/* Desktop: lang toggle + CTA */}
                <div className="hidden nav:flex items-center gap-3">
                    <LangToggle lang={lang} onLangChange={onLangChange} />
                    <CtaButton />
                </div>

                {/* Mobile: hamburger */}
                <button
                    type="button"
                    onClick={() => setNavOpen(o => !o)}
                    aria-label={navOpen ? 'Đóng menu' : 'Mở menu'}
                    className={`hidden max-nav:flex w-10 h-10 rounded-[10px] border border-border-bright cursor-pointer flex-col items-center justify-center gap-[5px] shrink-0 ${
                        navOpen ? 'bg-[rgba(26,111,208,0.1)]' : 'bg-glass'
                    }`}
                >
                    <span className={`block w-[18px] h-[1.5px] bg-text rounded-full transition-[transform,opacity] duration-200 ${
                        navOpen ? 'translate-y-[6.5px] rotate-45' : ''
                    }`} />
                    <span className={`block w-[18px] h-[1.5px] bg-text rounded-full transition-opacity duration-200 ${
                        navOpen ? 'opacity-0' : 'opacity-100'
                    }`} />
                    <span className={`block w-[18px] h-[1.5px] bg-text rounded-full transition-[transform,opacity] duration-200 ${
                        navOpen ? '-translate-y-[6.5px] -rotate-45' : ''
                    }`} />
                </button>
            </div>

            {/* Mobile: slide-down panel */}
            {navOpen && (
                <div className="hidden max-nav:flex bg-sky border-t border-border animate-nav-drop py-3.5 px-5 items-center justify-between">
                    <LangToggle lang={lang} onLangChange={onLangChange} />
                    <CtaButton />
                </div>
            )}
        </nav>
    );
}

export default Navbar;
