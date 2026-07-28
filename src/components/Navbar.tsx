import { useState, useEffect } from 'react';
import logo from "../assets/logo.jpg";
import type { Lang } from '../types';

interface NavbarProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

function LangToggle({ lang, onLangChange }: NavbarProps) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: 3,
            background: 'rgba(26,111,208,0.1)',
            border: '1px solid rgba(26,111,208,0.2)',
            borderRadius: 10,
        }}>
            {(['VI', 'EN'] as Lang[]).map(l => (
                <button
                    type="button"
                    key={l}
                    onClick={() => l === 'VI' && onLangChange('VI')}
                    style={{
                        padding: '5px 12px',
                        borderRadius: 7,
                        border: 'none',
                        cursor: l === 'EN' ? 'default' : 'pointer',
                        fontFamily: 'Be Vietnam Pro, sans-serif',
                        fontWeight: 600,
                        fontSize: 13,
                        transition: 'background 0.18s, color 0.18s',
                        background: lang === l ? 'var(--primary)' : 'transparent',
                        color: lang === l ? 'white' : 'var(--primary)',
                    }}
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
            style={{
                fontFamily: 'Be Vietnam Pro, sans-serif',
                fontWeight: 500,
                fontSize: 13,
                color: 'white',
                background: 'var(--primary)',
                padding: '11px 20px',
                borderRadius: 999,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'transform 0.18s',
                display: 'inline-block',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
            + Đăng hoạt động
        </a>
    );
}

function Navbar({ lang, onLangChange }: NavbarProps) {
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [navOpen, setNavOpen] = useState<boolean>(false);

    useEffect(() => {
        function onResize(): void {
            const mobile = window.innerWidth <= 900;
            setIsMobile(mobile);
            if (!mobile) setNavOpen(false);
        }
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        document.body.style.overflow = navOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [navOpen]);

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            backgroundColor: 'var(--sky)',
            borderBottom: '1px solid var(--border)',
        }}>
            <div style={{
                padding: isMobile ? '14px 20px' : '14px 40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                {/* Logo + wordmark */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                        src={logo.src}
                        alt="ECS Finder logo"
                        style={{ width: 44, height: 44, borderRadius: 11, objectFit: 'cover', border: '1px solid var(--border)' }}
                    />
                    <span style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 700,
                        fontSize: 18,
                        letterSpacing: '-0.01em',
                        color: 'var(--text)',
                    }}>ECS Finder</span>
                </div>

                {/* Desktop: lang toggle + CTA */}
                {!isMobile && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <LangToggle lang={lang} onLangChange={onLangChange} />
                        <CtaButton />
                    </div>
                )}

                {/* Mobile: hamburger */}
                {isMobile && (
                    <button
                        type="button"
                        onClick={() => setNavOpen(o => !o)}
                        aria-label={navOpen ? 'Đóng menu' : 'Mở menu'}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            border: '1px solid var(--border-bright)',
                            background: navOpen ? 'rgba(26,111,208,0.1)' : 'var(--glass)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 5,
                            flexShrink: 0,
                        }}
                    >
                        <span style={{
                            display: 'block', width: 18, height: 1.5,
                            background: 'var(--text)', borderRadius: 999,
                            transition: 'transform 0.2s, opacity 0.2s',
                            transform: navOpen ? 'translateY(6.5px) rotate(45deg)' : 'none',
                        }} />
                        <span style={{
                            display: 'block', width: 18, height: 1.5,
                            background: 'var(--text)', borderRadius: 999,
                            opacity: navOpen ? 0 : 1,
                            transition: 'opacity 0.2s',
                        }} />
                        <span style={{
                            display: 'block', width: 18, height: 1.5,
                            background: 'var(--text)', borderRadius: 999,
                            transition: 'transform 0.2s, opacity 0.2s',
                            transform: navOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
                        }} />
                    </button>
                )}
            </div>

            {/* Mobile: slide-down panel */}
            {isMobile && navOpen && (
                <div style={{
                    background: 'var(--sky)',
                    borderTop: '1px solid var(--border)',
                    animation: 'navDrop 0.2s ease both',
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <LangToggle lang={lang} onLangChange={onLangChange} />
                    <CtaButton />
                </div>
            )}
        </nav>
    );
}

export default Navbar;
