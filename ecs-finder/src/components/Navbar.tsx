import logo from "../assets/logo.jpg";
import type { Lang } from '../types';

interface NavbarProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

function Navbar({ lang, onLangChange }: NavbarProps) {
    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            backgroundColor: 'var(--sky)',
            borderBottom: '1px solid var(--border)',
            padding: '14px 40px',
            display: 'flex',
            alignItems: 'center',
            gap: '28px',
        }}>
            {/* Logo + wordmark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <img
                    src={logo}
                    alt="ECS Finder logo"
                    style={{ width: 44, height: 44, borderRadius: 11, objectFit: 'cover', border: '1px solid var(--border)' }}
                />
                <span style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    fontSize: 18,
                    letterSpacing: '-0.01em',
                    color: 'var(--text)',
                    width: 141,
                }}>ECS Finder</span>
            </div>

            {/* Nav links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                {['Trang chủ', 'Hoạt động', 'Về chúng tôi', 'Liên hệ'].map(link => (
                    <a
                        key={link}
                        href="#"
                        style={{
                            fontFamily: 'Be Vietnam Pro, sans-serif',
                            fontWeight: 600,
                            fontSize: 14,
                            color: 'var(--text-dim)',
                            padding: '8px 13px',
                            borderRadius: 9,
                            textDecoration: 'none',
                            transition: 'color 0.18s, background 0.18s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.color = 'var(--primary)';
                            e.currentTarget.style.background = 'rgba(47,123,255,0.1)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.color = 'var(--text-dim)';
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        {link}
                    </a>
                ))}
            </div>

            {/* Language toggle + CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
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
            </div>
        </nav>
    );
}

export default Navbar;
