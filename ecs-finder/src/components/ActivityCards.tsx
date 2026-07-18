import { useState, useEffect } from 'react';
import { mockActivities, filterActivities, daysLeft } from '../data/Activities';
import type { Activity, TopicFilter, DeadlineFilter } from '../types';

const ACCENT_PAIRS: [string, string][] = [
    ['#1f6fe0','#37b9ff'],
    ['#1487c9','#3fd0c8'],
    ['#3a63e6','#6aa8ff'],
    ['#1f7ae6','#46c6ff'],
    ['#2467d8','#57b0ff'],
    ['#0f74d6','#38c6f0'],
];

const TOPIC_ACCENTS: Record<string, string> = {
    'STEM':                     '#12a6c9',
    'Xã hội':                   '#0db87a',
    'Môi trường':               '#0dba45',
    'Kinh tế':                  '#0d7aba',
    'Nghệ thuật & Sáng tạo':   '#7a5cff',
    'Ngôn ngữ & Giao tiếp':    '#3d5cff',
    'Sức khỏe':                 '#c933e6',
};

const CARDS_PER_PAGE = 6;

interface ActivityCardsProps {
    searchQuery?: string;
    topicFilters?: TopicFilter;
    categoryFilter?: string;
    deadlineFilter?: DeadlineFilter;
    positionFilters?: string[];
    onResultCountChange?: (count: number) => void;
    onPageInfoChange?: (page: number, totalPages: number) => void;
}

interface ActivityCardProps {
    activity: Activity;
    index: number;
    onClick: () => void;
}

interface DetailModalProps {
    activity: Activity;
    onClose: () => void;
}

interface DaysBadgeProps {
    iso: string;
}

function formatDeadlineDisplay(iso: string): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
}

function DaysBadge({ iso }: DaysBadgeProps) {
    const days = daysLeft(iso);
    if (days === null) return null;
    const closed = days < 0;
    const urgent = !closed && days <= 10;
    return (
        <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'white',
            background: closed ? '#546675' : urgent ? '#e33f3f' : 'rgba(9,20,40,0.42)',
            border: '1px solid rgba(255,255,255,0.32)',
            borderRadius: 7,
            padding: '4px 9px',
            whiteSpace: 'nowrap',
        }}>
            {closed ? 'Đã đóng' : `${days} ngày`}
        </span>
    );
}

function ActivityCard({ activity, index, onClick }: ActivityCardProps) {
    const accent = activity.accent ?? ACCENT_PAIRS[index % ACCENT_PAIRS.length];
    const topicAccent = TOPIC_ACCENTS[activity.topic] ?? 'var(--primary)';
    const [hovered, setHovered] = useState<boolean>(false);

    const cardStyle: React.CSSProperties = {
        background: 'var(--glass)',
        border: hovered ? `1px solid ${topicAccent}` : '1px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s, border-color 0.3s',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered
            ? `0 18px 40px rgba(20,44,68,0.16), 0 0 0 1px ${topicAccent}, 0 0 24px ${topicAccent}44`
            : '0 2px 8px rgba(20,44,68,0.07)',
        animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 60}ms both`,
    };

    const imageAreaStyle: React.CSSProperties = {
        height: 150,
        background: `
            repeating-linear-gradient(135deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1.5px, transparent 1.5px, transparent 15px),
            linear-gradient(140deg, ${accent[0]}, ${accent[1]})
        `,
        padding: 13,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        position: 'relative',
    };

    return (
        <div style={cardStyle} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onClick}>
            <div style={imageAreaStyle}>
                {activity.image && (
                    <img
                        src={activity.image}
                        alt={activity.name}
                        referrerPolicy="no-referrer"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                )}
                {activity.image && (
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.18) 100%)' }} />
                )}
                <span style={{
                    position: 'relative', zIndex: 1,
                    fontSize: 10.5, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em',
                    background: 'rgba(9,20,40,0.34)', border: '1px solid rgba(255,255,255,0.32)',
                    borderRadius: 7, padding: '4px 9px',
                }}>
                    {activity.category}
                </span>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <DaysBadge iso={activity.deadline} />
                </div>
                {!activity.image && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" opacity="0.5">
                            <rect x="4" y="8" width="32" height="24" rx="3" stroke="white" strokeWidth="1.5"/>
                            <circle cx="14" cy="17" r="3.5" stroke="white" strokeWidth="1.5"/>
                            <path d="M4 26l9-7 7 6 5-4 11 7" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                        </svg>
                    </div>
                )}
            </div>

            <div style={{ padding: '16px 17px 17px', display: 'flex', flexDirection: 'column', gap: 11 }}>
                <h3 style={{
                    fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 16,
                    lineHeight: 1.3, color: 'var(--text)', margin: 0,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {activity.name}
                </h3>

                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    {activity.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-dim)' }}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1C4.8 1 3 2.8 3 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" stroke="var(--primary)" strokeWidth="1.3"/><circle cx="7" cy="5" r="1.5" stroke="var(--primary)" strokeWidth="1.3"/></svg>
                            {activity.location}
                        </span>
                    )}
                    {activity.deadline && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-dim)' }}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="var(--primary)" strokeWidth="1.3"/><path d="M7 4.5v2.8l1.8 1.8" stroke="var(--primary)" strokeWidth="1.3" strokeLinecap="round"/></svg>
                            {formatDeadlineDisplay(activity.deadline)}
                        </span>
                    )}
                </div>

                {(activity.topic || activity.subtopic) && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {activity.topic && (
                            <span style={{
                                fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                                background: `${topicAccent}22`, color: topicAccent, border: `1px solid ${topicAccent}44`,
                            }}>{activity.topic}</span>
                        )}
                        {activity.subtopic && (
                            <span style={{
                                fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 999,
                                background: `${topicAccent}11`, color: topicAccent, border: `1px solid ${topicAccent}33`,
                            }}>{activity.subtopic}</span>
                        )}
                    </div>
                )}

                {activity.positions?.length > 0 && (
                    <div style={{
                        borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 2,
                        fontSize: 12, color: 'var(--text-faint)',
                    }}>
                        <span style={{ fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 11.5 }}>Vị trí: </span>
                        <span style={{ color: 'var(--accent-2)', fontWeight: 500, fontSize: 12.5 }}>
                            {activity.positions.join(' · ')}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

function DetailModal({ activity, onClose }: DetailModalProps) {
    const accent = activity.accent ?? ACCENT_PAIRS[0];

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        function onKey(e: KeyboardEvent): void { if (e.key === 'Escape') onClose(); }
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKey);
        };
    }, [onClose]);

    return (
        <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(18,40,62,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'var(--glass)', borderRadius: 22, maxWidth: 620, width: '100%',
                    boxShadow: '0 30px 80px rgba(20,44,68,0.3)', overflow: 'hidden',
                    animation: 'fadeUp 0.25s ease both', maxHeight: '90vh', overflowY: 'auto',
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{
                    height: 172,
                    background: `linear-gradient(135deg, ${accent[0]}, ${accent[1]})`,
                    padding: '24px 26px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    position: 'relative',
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: 16, right: 16,
                            width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)',
                            background: 'rgba(10,20,32,0.55)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M4 4l10 10M14 4L4 14" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                    </button>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                        {activity.category}
                    </span>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 64, color: 'rgba(255,255,255,0.95)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                        {activity.acronym || activity.name?.slice(0, 3).toUpperCase()}
                    </span>
                </div>

                <div style={{ padding: '26px 28px 30px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 27, lineHeight: 1.2, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
                        {activity.name}
                    </h2>

                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                        {([
                            { label: 'ĐỊA ĐIỂM', value: activity.location, icon: <svg width="15" height="15" viewBox="0 0 14 14" fill="none"><path d="M7 1C4.8 1 3 2.8 3 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" stroke="var(--primary)" strokeWidth="1.3"/><circle cx="7" cy="5" r="1.5" stroke="var(--primary)" strokeWidth="1.3"/></svg> },
                            { label: 'HẠN ĐĂNG KÝ', value: formatDeadlineDisplay(activity.deadline), icon: <svg width="15" height="15" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="var(--primary)" strokeWidth="1.3"/><path d="M7 4.5v2.8l1.8 1.8" stroke="var(--primary)" strokeWidth="1.3" strokeLinecap="round"/></svg> },
                            { label: 'CHỦ ĐỀ', value: activity.topic, icon: null },
                        ] as { label: string; value: string; icon: React.ReactNode }[]).filter(m => m.value).map(meta => (
                            <div key={meta.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: 11.5, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 600 }}>{meta.label}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, color: 'var(--text)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                                    {meta.icon}{meta.value}
                                </span>
                            </div>
                        ))}
                    </div>

                    {activity.desc && (
                        <p style={{ fontSize: 15, lineHeight: 1.72, color: 'var(--text-dim)', margin: 0, fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                            {activity.desc}
                        </p>
                    )}

                    {(activity.topic || activity.subtopic) && (() => {
                        const c = TOPIC_ACCENTS[activity.topic] ?? 'var(--primary)';
                        return (
                            <div>
                                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Thẻ</span>
                                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                                    {activity.topic && <span style={{ fontSize: 13, fontWeight: 600, padding: '5px 12px', borderRadius: 999, background: `${c}22`, color: c, border: `1px solid ${c}44` }}>{activity.topic}</span>}
                                    {activity.subtopic && <span style={{ fontSize: 13, fontWeight: 500, padding: '5px 12px', borderRadius: 999, background: `${c}11`, color: c, border: `1px solid ${c}33` }}>{activity.subtopic}</span>}
                                </div>
                            </div>
                        );
                    })()}

                    {activity.positions?.length > 0 && (
                        <div>
                            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Vị trí tuyển</span>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {activity.positions.map(p => (
                                    <span key={p} style={{
                                        fontSize: 13, color: 'var(--text)', padding: '6px 12px', borderRadius: 8,
                                        background: 'rgba(47,123,255,0.12)', border: '1px solid rgba(47,123,255,0.2)',
                                        fontFamily: 'Be Vietnam Pro, sans-serif',
                                    }}>{p}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <a
                        href={activity.link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            background: 'var(--ink)', color: 'var(--ink-text)',
                            padding: 15, borderRadius: 999, textDecoration: 'none',
                            fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 500, fontSize: 15, letterSpacing: '0.02em',
                            boxShadow: '0 10px 26px rgba(21,25,29,0.22)',
                        }}
                    >
                        Đăng ký ngay
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M4 9h10M10 5l4 4-4 4" stroke="var(--ink-text)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}

function ActivityCards({
    searchQuery = '',
    topicFilters = { topics: [], subtopics: [] },
    categoryFilter = '',
    deadlineFilter = '',
    positionFilters = [],
    onResultCountChange,
    onPageInfoChange,
}: ActivityCardsProps) {
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

    const filtered = filterActivities(mockActivities, { searchQuery, categoryFilter, deadlineFilter, topicFilters, positionFilters });
    const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);

    useEffect(() => { setCurrentPage(0); }, [searchQuery, categoryFilter, deadlineFilter, topicFilters, positionFilters]);
    useEffect(() => { onResultCountChange?.(filtered.length); }, [filtered.length, onResultCountChange]);
    useEffect(() => { onPageInfoChange?.(currentPage, totalPages); }, [currentPage, totalPages, onPageInfoChange]);

    const paged = filtered.slice(currentPage * CARDS_PER_PAGE, (currentPage + 1) * CARDS_PER_PAGE);

    return (
        <div>
            {filtered.length === 0 ? (
                <div style={{
                    background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: 18,
                    padding: '48px 32px', textAlign: 'center',
                }}>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>
                        Không tìm thấy hoạt động
                    </p>
                    <p style={{ fontFamily: 'Be Vietnam Pro, sans-serif', fontSize: 14, color: 'var(--text-faint)' }}>
                        Thử điều chỉnh bộ lọc hoặc từ khoá tìm kiếm.
                    </p>
                </div>
            ) : (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(232px, 1fr))',
                        gap: 18,
                    }}>
                        {paged.map((activity, i) => (
                            <ActivityCard
                                key={activity.id}
                                activity={activity}
                                index={i}
                                onClick={() => setSelectedActivity(activity)}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 28 }}>
                            <button
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                                style={{
                                    padding: '7px 13px', borderRadius: 9, border: '1px solid var(--border)',
                                    background: 'var(--glass)', cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === 0 ? 0.5 : 1,
                                    fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--text-dim)',
                                }}
                            >←</button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i)}
                                    style={{
                                        padding: '7px 13px', borderRadius: 9, border: '1px solid var(--border)',
                                        background: i === currentPage ? 'var(--primary)' : 'var(--glass)',
                                        color: i === currentPage ? 'white' : 'var(--text-dim)',
                                        fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: i === currentPage ? 700 : 400,
                                        fontSize: 14, cursor: 'pointer',
                                    }}
                                >{i + 1}</button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={currentPage === totalPages - 1}
                                style={{
                                    padding: '7px 13px', borderRadius: 9, border: '1px solid var(--border)',
                                    background: 'var(--glass)', cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === totalPages - 1 ? 0.5 : 1,
                                    fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--text-dim)',
                                }}
                            >→</button>
                        </div>
                    )}
                </>
            )}

            {selectedActivity && (
                <DetailModal activity={selectedActivity} onClose={() => setSelectedActivity(null)} />
            )}
        </div>
    );
}

export default ActivityCards;
