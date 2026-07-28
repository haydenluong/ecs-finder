import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import { topicSet, TOPIC_ACCENTS } from '../data/tagData';
import type { TopicFilter, Tag } from '../types';

interface ChipPosition {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    animDelay: string;
    animDur: string;
}

interface HeroSectionProps {
    activitiesCount: number;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    topicFilters: TopicFilter;
    onTagClick: (tag: Tag) => void;
}

const MAG_TRANSFORMS = [
    'translate(-64px,-46px) rotate(-14deg) scale(1.05)',
    'translate(66px,-14px) rotate(12deg) scale(1.05)',
    'translate(-38px,64px) rotate(-10deg) scale(1.05)',
] as const;

const CHIP_POSITIONS: ChipPosition[] = [
    { top: 30,  left: 2,   animDelay: '0s',   animDur: '5s' },
    { top: 70,  right: -6, animDelay: '0.5s', animDur: '6.2s' },
    { bottom: 40, left: 34, animDelay: '0.9s', animDur: '5.6s' },
];

function pickSlotTopics(): string[] {
    const pool = topicSet.map(t => t.name);
    const out: string[] = [];
    for (let i = 0; i < 3; i++) {
        out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return out;
}

function HeroSection({ activitiesCount, searchQuery, onSearchChange, topicFilters, onTagClick }: HeroSectionProps) {
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [isSmall, setIsSmall]   = useState<boolean>(false);
    const [displayCount, setDisplayCount] = useState<number>(0);
    const [hoverTag, setHoverTag] = useState<number | null>(null);
    const [slotTopics, setSlotTopics] = useState<string[]>(() => topicSet.slice(0, 3).map(t => t.name));
    const [hoveredRandom, setHoveredRandom] = useState<boolean>(false);
    const [animKey, setAnimKey] = useState<number>(0);
    const [typedWord, setTypedWord] = useState<string>('');

    // typing animation
    useEffect(() => {
        const fullWord = 'ngoại khoá';
        let i = 0;
        const id = setInterval(() => {
            i++;
            setTypedWord(fullWord.slice(0, i));
            if (i >= fullWord.length) clearInterval(id);
        }, 55);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- randomize only after hydration, so server and client HTML match
        setSlotTopics(pickSlotTopics());
    }, []);

    useEffect(() => {
        function onResize(): void {
            setIsMobile(window.innerWidth <= 920);
            setIsSmall(window.innerWidth <= 560);
        }
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        if (activitiesCount === 0) return;
        const duration = 1000;
        const start = performance.now();
        let raf: number;
        function tick(now: number) {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplayCount(Math.round(eased * activitiesCount));
            if (t < 1) raf = requestAnimationFrame(tick);
        }
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [activitiesCount]);

    function randomizeTags(): void {
        setSlotTopics(pickSlotTopics());
        setAnimKey(k => k + 1);
    }

    const sectionPadding = isSmall ? '48px 18px 30px' : isMobile ? '48px 22px 30px' : '44px 40px 30px';

    return (
        <section style={{ padding: sectionPadding, maxWidth: 1320, margin: '0 auto' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) minmax(0,430px)',
                gap: 44,
                alignItems: 'center',
            }}>
                {/* Left column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'var(--glass)',
                        border: '1px solid var(--border)',
                        borderRadius: 999,
                        padding: '6px 14px',
                        width: 'fit-content',
                        animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0ms both',
                    }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 600, fontSize: 12.5, color: 'var(--primary)' }}>
                            {displayCount} hoạt động đang mở đăng ký
                        </span>
                    </div>

                    <h1 style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 800,
                        fontSize: isMobile ? 42 : 50,
                        lineHeight: 1.05,
                        letterSpacing: '-0.015em',
                        color: 'var(--text)',
                        maxWidth: '16ch',
                        margin: 0,
                        animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 60ms both',
                    }}>
                        Soi sáng hành trình{' '}
                        <span style={{ color: 'var(--primary)', position: 'relative', display: 'inline-block' }}>
                            <span style={{ visibility: 'hidden' }}>ngoại khoá</span>
                            <span style={{ position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap' }}>
                                {typedWord}
                                <span aria-hidden="true" style={{
                                    fontWeight: 400,
                                    marginLeft: 1,
                                    animation: 'blink 0.9s step-end infinite',
                                }}>|</span>
                            </span>
                        </span>
                        {' '}của bạn
                    </h1>

                    <p style={{
                        fontFamily: 'Be Vietnam Pro, sans-serif',
                        fontWeight: 400,
                        fontSize: 16.5,
                        lineHeight: 1.6,
                        color: 'var(--text-dim)',
                        maxWidth: '48ch',
                        margin: 0,
                        animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 120ms both',
                    }}>
                        Khám phá câu lạc bộ, cuộc thi, dự án và sự kiện dành cho học sinh, sinh viên trên khắp Việt Nam.
                    </p>

                    <div style={{ animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 180ms both' }}>
                        <SearchBar searchQuery={searchQuery} onChange={onSearchChange} />
                    </div>
                </div>

                {/* Right column — hidden on mobile */}
                <div id="heroVisual" style={{ position: 'relative', display: isMobile ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                        position: 'absolute',
                        width: 160,
                        height: 160,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.38) 45%, transparent 72%)',
                        zIndex: 0,
                        pointerEvents: 'none',
                        transform: 'translate(-22px, -18px)',
                    }} />

                    <div style={{
                        transition: 'transform 0.55s cubic-bezier(0.34,1.4,0.4,1)',
                        transform: hoverTag !== null ? MAG_TRANSFORMS[hoverTag] : 'translate(0,0) rotate(0deg) scale(1)',
                    }}>
                        <svg
                            width="248"
                            viewBox="0 0 200 200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{
                                position: 'relative',
                                zIndex: 1,
                                filter: 'drop-shadow(0 16px 24px rgba(26,111,208,0.14))',
                                animation: 'floatMag 6s ease-in-out infinite',
                                opacity: 0.72,
                            }}
                        >
                            {/* magnifying glass draw */}
                            <defs>
                                <radialGradient id="lensGrad" cx="40%" cy="35%" r="65%">
                                    <stop offset="0%" stopColor="white" stopOpacity="0.55"/>
                                    <stop offset="55%" stopColor="#a8d5f5" stopOpacity="0.25"/>
                                    <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
                                </radialGradient>
                                <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#dceefa" stopOpacity="0.9"/>
                                    <stop offset="50%" stopColor="#a8d5f5" stopOpacity="0.7"/>
                                    <stop offset="100%" stopColor="#69aeea" stopOpacity="0.5"/>
                                </linearGradient>
                                <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#90c8f5"/>
                                    <stop offset="55%" stopColor="#5aaee0"/>
                                    <stop offset="100%" stopColor="#2f86c8"/>
                                </linearGradient>
                            </defs>
                            <circle cx="82" cy="82" r="58" fill="url(#lensGrad)"/>
                            <circle cx="82" cy="82" r="58" stroke="url(#rimGrad)" strokeWidth="19" fill="none"/>
                            <circle cx="82" cy="82" r="67.5" stroke="rgba(255,255,255,0.9)" strokeWidth="2" fill="none"/>
                            <circle cx="82" cy="82" r="48.5" stroke="rgba(255,255,255,0.9)" strokeWidth="2" fill="none"/>
                            <line x1="125" y1="125" x2="168" y2="168" stroke="url(#handleGrad)" strokeWidth="24" strokeLinecap="round"/>
                            <line x1="126" y1="124" x2="165" y2="163" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.35"/>
                            <path d="M 48 55 A 42 42 0 0 1 80 42" stroke="white" strokeWidth="7" strokeLinecap="round" opacity="0.45" fill="none"/>
                            <circle cx="56" cy="52" r="3.2" fill="white" opacity="0.4"/>
                        </svg>
                    </div>

                    {/* Floating topic chips */}
                    {CHIP_POSITIONS.map((pos, i) => {
                        const isActive = topicFilters.topics.includes(slotTopics[i]);
                        const dotColor = TOPIC_ACCENTS[slotTopics[i]] ?? 'var(--primary)';
                        return (
                            <button
                                type="button"
                                key={`${slotTopics[i]}-${animKey}`}
                                onClick={() => onTagClick({ type: 'topic', label: slotTopics[i] })}
                                onMouseEnter={() => setHoverTag(i)}
                                onMouseLeave={() => setHoverTag(null)}
                                style={{
                                    position: 'absolute',
                                    top: pos.top,
                                    left: pos.left,
                                    right: pos.right,
                                    bottom: pos.bottom,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 7,
                                    background: 'var(--glass)',
                                    border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                                    borderRadius: 999,
                                    padding: '7px 13px 7px 11px',
                                    boxShadow: isActive ? '0 16px 30px rgba(20,44,68,0.22)' : '0 12px 26px rgba(20,44,68,0.15)',
                                    fontFamily: 'Be Vietnam Pro, sans-serif',
                                    fontWeight: 600,
                                    fontSize: 12.5,
                                    color: 'var(--text)',
                                    cursor: 'pointer',
                                    animation: animKey > 0
                                        ? `tagPop 0.35s cubic-bezier(0.34,1.4,0.4,1) both, floaty ${pos.animDur} ${pos.animDelay} ease-in-out infinite`
                                        : `floaty ${pos.animDur} ${pos.animDelay} ease-in-out infinite`,
                                    zIndex: 2,
                                    transition: 'border-color 0.18s, box-shadow 0.18s',
                                }}
                            >
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, display: 'inline-block', flexShrink: 0 }} />
                                {slotTopics[i]}
                            </button>
                        );
                    })}

                    {/* Randomizer button */}
                    <button
                        type="button"
                        aria-label="Chọn chủ đề ngẫu nhiên"
                        onClick={randomizeTags}
                        onMouseEnter={() => setHoveredRandom(true)}
                        onMouseLeave={() => setHoveredRandom(false)}
                        style={{
                            position: 'absolute', left: -16, top: '50%', transform: 'translateY(-50%)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                            background: 'none', border: 'none', cursor: 'pointer', zIndex: 3,
                        }}
                    >
                        <span style={{
                            width: 44, height: 44, borderRadius: '50%', background: '#ffffff',
                            border: hoveredRandom ? '1px solid var(--accent)' : '1px solid var(--border)',
                            boxShadow: hoveredRandom
                                ? '0 12px 26px rgba(20,44,68,0.22)'
                                : '0 12px 26px rgba(20,44,68,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transform: hoveredRandom ? 'scale(1.08)' : 'scale(1)',
                            transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
                        }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M3 6h9.5M15 4l2.5 2L15 8M3 14h9.5M15 12l2.5 2-2.5 2" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M6 4l-2.5 2L6 8M6 12l-2.5 2 2.5 2" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                            </svg>
                        </span>
                        <span style={{
                            fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 600,
                            fontSize: 12, color: 'var(--text-dim)',
                        }}>Ngẫu nhiên</span>
                    </button>
                </div>
            </div>
        </section>
    );
}

export default HeroSection;
