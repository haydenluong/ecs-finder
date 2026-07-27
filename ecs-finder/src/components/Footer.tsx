import { useState } from 'react';
import logo from '../assets/logo.jpg';

const CONTACT_EMAIL = 'timkiemhoatdongngoaikhoa@gmail.com';

const D = {
    bg:      'var(--sky)',
    border:  'var(--border)',
    text:    'var(--text)',
    dim:     'var(--text-dim)',
    faint:   'var(--text-faint)',
    btnBg:   'rgba(20,52,80,0.05)',
    btnHov:  'rgba(20,52,80,0.09)',
    accent:  'var(--primary)',
};

function Footer() {
    const [copied, setCopied] = useState(false);

    function handleCopy() {
        navigator.clipboard.writeText(CONTACT_EMAIL).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    return (
        <footer style={{
            background: D.bg,
            borderTop: `1px solid ${D.border}`,
        }}>
            <div style={{
                maxWidth: 1320,
                margin: '0 auto',
                padding: '48px 40px 32px',
            }}>
                {/* Top row */}
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 40,
                    flexWrap: 'wrap',
                    marginBottom: 40,
                }}>
                    {/* Branding */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img
                                src={logo}
                                alt="ECS Finder logo"
                                style={{ width: 36, height: 36, borderRadius: 9, objectFit: 'cover', border: `1px solid ${D.border}` }}
                            />
                            <span style={{
                                fontFamily: 'Montserrat, sans-serif',
                                fontWeight: 700,
                                fontSize: 16,
                                letterSpacing: '-0.01em',
                                color: D.text,
                            }}>ECS Finder</span>
                        </div>
                        <p style={{
                            fontFamily: 'Be Vietnam Pro, sans-serif',
                            fontSize: 13.5,
                            lineHeight: 1.6,
                            color: D.dim,
                            margin: 0,
                            maxWidth: '32ch',
                        }}>
                            Khám phá hoạt động ngoại khoá dành cho học sinh &amp; sinh viên Việt Nam.
                        </p>
                    </div>

                    {/* Contact block */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
                        <span style={{
                            fontFamily: 'Be Vietnam Pro, sans-serif',
                            fontWeight: 700,
                            fontSize: 11,
                            letterSpacing: '0.09em',
                            color: D.faint,
                            textTransform: 'uppercase',
                        }}>Liên hệ</span>

                        {/* Copy email button */}
                        <button
                            type="button"
                            onClick={handleCopy}
                            title="Sao chép địa chỉ email"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 14px',
                                borderRadius: 10,
                                border: `1px solid ${copied ? D.accent + '55' : D.border}`,
                                background: copied ? 'rgba(26,111,208,0.08)' : D.btnBg,
                                cursor: 'pointer',
                                transition: 'background 0.18s, border-color 0.18s',
                                minWidth: 0,
                            }}
                            onMouseEnter={e => { if (!copied) { e.currentTarget.style.background = D.btnHov; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; } }}
                            onMouseLeave={e => { if (!copied) { e.currentTarget.style.background = D.btnBg; e.currentTarget.style.borderColor = D.border; } }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                                <rect x="2" y="4" width="20" height="16" rx="3" stroke={D.accent} strokeWidth="1.6"/>
                                <path d="M2 7l10 7 10-7" stroke={D.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{
                                fontFamily: 'Be Vietnam Pro, sans-serif',
                                fontSize: 13.5,
                                fontWeight: 500,
                                color: D.text,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {CONTACT_EMAIL}
                            </span>
                            <span style={{ flexShrink: 0, color: copied ? D.accent : D.faint, transition: 'color 0.18s', marginLeft: 4 }}>
                                {copied ? (
                                    <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                                        <path d="M3 9l4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                ) : (
                                    <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                                        <rect x="6" y="1" width="11" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.4"/>
                                        <rect x="1" y="4" width="11" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.4" fill="var(--sky)"/>
                                    </svg>
                                )}
                            </span>
                        </button>

                        {/* Response time */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 2 }}>
                            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="5.5" stroke={D.faint} strokeWidth="1.3"/>
                                <path d="M7 4.5v2.8l1.8 1.8" stroke={D.faint} strokeWidth="1.3" strokeLinecap="round"/>
                            </svg>
                            <span style={{
                                fontFamily: 'Be Vietnam Pro, sans-serif',
                                fontSize: 12.5,
                                color: D.faint,
                            }}>
                                Phản hồi trong vòng 24 giờ
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div style={{
                    borderTop: `1px solid ${D.border}`,
                    paddingTop: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 8,
                }}>
                    <span style={{ fontFamily: 'Be Vietnam Pro, sans-serif', fontSize: 12.5, color: D.faint }}>
                        © 2025 ECS Finder. All rights reserved.
                    </span>
                    <span style={{ fontFamily: 'Be Vietnam Pro, sans-serif', fontSize: 12.5, color: D.faint }}>
                        Dành cho học sinh &amp; sinh viên Việt Nam
                    </span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
