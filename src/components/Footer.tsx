import { useState } from 'react';
import logo from '../assets/logo.jpg';

const CONTACT_EMAIL = 'timkiemhoatdongngoaikhoa@gmail.com';

function Footer() {
    const [copied, setCopied] = useState(false);

    function handleCopy() {
        navigator.clipboard.writeText(CONTACT_EMAIL).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    return (
        <footer className="bg-sky border-t border-border">
            <div className="max-w-[1320px] mx-auto pt-12 px-10 pb-8">
                {/* Top row */}
                <div className="flex items-start justify-between gap-10 flex-wrap mb-10">
                    {/* Branding */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                            <img
                                src={logo.src}
                                alt="ECS Finder logo"
                                className="w-9 h-9 rounded-[9px] object-cover border border-border"
                            />
                            <span className="font-heading font-bold text-[16px] tracking-[-0.01em] text-text">ECS Finder</span>
                        </div>
                        <p className="text-[13.5px] leading-[1.6] text-text-dim m-0 max-w-[32ch]">
                            Khám phá hoạt động ngoại khoá dành cho học sinh &amp; sinh viên Việt Nam.
                        </p>
                    </div>

                    {/* Contact block */}
                    <div className="flex flex-col gap-2.5 min-w-0">
                        <span className="font-bold text-[11px] tracking-[0.09em] text-text-faint uppercase">Liên hệ</span>

                        {/* Copy email button */}
                        <button
                            type="button"
                            onClick={handleCopy}
                            title="Sao chép địa chỉ email"
                            className={`flex items-center gap-2.5 py-2.5 px-3.5 rounded-[10px] border cursor-pointer min-w-0 transition-[background-color,border-color] duration-[180ms] ${
                                copied
                                    ? 'border-[rgba(26,111,208,0.33)] bg-[rgba(26,111,208,0.08)]'
                                    : 'border-border bg-[rgba(20,52,80,0.05)] hover:bg-[rgba(20,52,80,0.09)] hover:border-[rgba(255,255,255,0.16)]'
                            }`}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 text-primary">
                                <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.6"/>
                                <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-[13.5px] font-medium text-text overflow-hidden text-ellipsis whitespace-nowrap">
                                {CONTACT_EMAIL}
                            </span>
                            <span className={`shrink-0 ml-1 transition-colors duration-[180ms] ${copied ? 'text-primary' : 'text-text-faint'}`}>
                                {copied ? (
                                    <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                                        <path d="M3 9l4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                ) : (
                                    <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                                        <rect x="6" y="1" width="11" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.4"/>
                                        <rect x="1" y="4" width="11" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.4" fill="var(--color-sky)"/>
                                    </svg>
                                )}
                            </span>
                        </button>

                        {/* Response time */}
                        <div className="flex items-center gap-1.5 pl-0.5 text-text-faint">
                            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
                                <path d="M7 4.5v2.8l1.8 1.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                            </svg>
                            <span className="text-[12.5px]">
                                Phản hồi trong vòng 24 giờ
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-border pt-5 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[12.5px] text-text-faint">
                        © 2025 ECS Finder. All rights reserved.
                    </span>
                    <span className="text-[12.5px] text-text-faint">
                        Dành cho học sinh &amp; sinh viên Việt Nam
                    </span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
