import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

function Navbar({ lang, onLangChange }: NavbarProps) {
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
                    <NavLink href="/" active={pathname === '/'}>Trang chủ</NavLink>
                    <NavLink href="/submit" active={pathname === '/submit'}>Đăng hoạt động</NavLink>
                </div>

                {/* Desktop: lang toggle */}
                <div className="col-start-3 hidden nav:flex items-center justify-self-end">
                    <LangToggle lang={lang} onLangChange={onLangChange} />
                </div>

                {/* Mobile: hamburger, shares the third grid cell with the lang toggle above */}
                <button
                    type="button"
                    onClick={() => setNavOpen(o => !o)}
                    aria-label={navOpen ? 'Đóng menu' : 'Mở menu'}
                    className={`col-start-3 justify-self-end hidden max-nav:flex w-10 h-10 rounded-[10px] border border-border-bright cursor-pointer flex-col items-center justify-center gap-[5px] shrink-0 ${
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
                <div className="hidden max-nav:flex bg-sky border-t border-border animate-nav-drop py-3.5 px-5 flex-col items-center gap-3.5">
                    <NavLink href="/" active={pathname === '/'}>Trang chủ</NavLink>
                    <NavLink href="/submit" active={pathname === '/submit'}>Đăng hoạt động</NavLink>
                    <LangToggle lang={lang} onLangChange={onLangChange} />
                </div>
            )}
        </nav>
    );
}

export default Navbar;
