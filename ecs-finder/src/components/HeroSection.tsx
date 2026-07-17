import SearchBar from './SearchBar';
import type { TopicFilter, Tag } from '../types';

interface HeroChip {
  label: string;
  topic: string;
  dot: string;
}

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

const HERO_CHIPS: HeroChip[] = [
    { label: 'STEM',     topic: 'STEM',                   dot: '#12a6c9' },
    { label: 'Sáng tạo', topic: 'Nghệ thuật & Sáng tạo', dot: '#7a5cff' },
    { label: 'Sức khỏe', topic: 'Sức khỏe',              dot: '#0dba45' },
];

const CHIP_POSITIONS: ChipPosition[] = [
    { top: 30,  left: 2,   animDelay: '0s',   animDur: '5s' },
    { top: 70,  right: -6, animDelay: '0.5s', animDur: '6.2s' },
    { bottom: 40, left: 34, animDelay: '0.9s', animDur: '5.6s' },
];

function HeroSection({ activitiesCount, searchQuery, onSearchChange, topicFilters, onTagClick }: HeroSectionProps) {
    function handleChipClick(chip: HeroChip): void {
        onTagClick({ type: 'topic', label: chip.topic });
    }

    return (
        <section style={{ padding: '44px 40px 30px', maxWidth: 1320, margin: '0 auto' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr) minmax(0,430px)',
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
                            {activitiesCount} hoạt động đang mở đăng ký
                        </span>
                    </div>

                    <h1 style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 800,
                        fontSize: 52,
                        lineHeight: 1.05,
                        letterSpacing: '-0.015em',
                        color: 'var(--text)',
                        maxWidth: '16ch',
                        margin: 0,
                        animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 60ms both',
                    }}>
                        Soi sáng hành trình{' '}
                        <span style={{ color: 'var(--primary)' }}>ngoại khoá</span>
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
                        Khám phá câu lạc bộ, cuộc thi, dự án và sự kiện dành cho học sinh, sinh viên trên khắp Việt Nam ở một nơi.
                    </p>

                    <div style={{ animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 180ms both' }}>
                        <SearchBar searchQuery={searchQuery} onChange={onSearchChange} />
                    </div>
                </div>

                {/* Right column */}
                <div id="heroVisual" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                        <line x1="125" y1="125" x2="168" y2="168" stroke="url(#handleGrad)" strokeWidth="24" strokeLinecap="round"/>
                        <line x1="126" y1="124" x2="165" y2="163" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.35"/>
                        <path d="M 48 55 A 42 42 0 0 1 80 42" stroke="white" strokeWidth="7" strokeLinecap="round" opacity="0.45" fill="none"/>
                        <circle cx="56" cy="52" r="3.2" fill="white" opacity="0.4"/>
                    </svg>

                    {HERO_CHIPS.map((chip, i) => {
                        const pos = CHIP_POSITIONS[i];
                        const isActive = topicFilters.topics.includes(chip.topic);
                        return (
                            <button
                                key={chip.label}
                                onClick={() => handleChipClick(chip)}
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
                                    animation: `floaty ${pos.animDur} ${pos.animDelay} ease-in-out infinite`,
                                    zIndex: 2,
                                    transition: 'border-color 0.18s, box-shadow 0.18s',
                                }}
                            >
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: chip.dot, display: 'inline-block', flexShrink: 0 }} />
                                {chip.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <style>{`
                @media (max-width: 920px) {
                    #heroVisual { display: none !important; }
                    section { padding: 48px 22px 30px !important; }
                    h1 { font-size: 42px !important; }
                }
                @media (max-width: 560px) {
                    section { padding: 48px 18px 30px !important; }
                }
            `}</style>
        </section>
    );
}

export default HeroSection;
