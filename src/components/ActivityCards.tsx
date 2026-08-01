import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { filterActivities, daysLeft } from '../data/Activities';
import { accentVars } from '../data/tagData';
import ActivityImage from './ActivityImage';
import type { Activity, TopicFilter, DeadlineFilter } from '../types';

const CARDS_PER_PAGE = 6;

// Stable identities so these defaults don't create a new object/array each render.
const EMPTY_TOPIC_FILTER: TopicFilter = { topics: [], subtopics: [] };
const EMPTY_POSITIONS: string[] = [];

interface ActivityCardsProps {
    activities: Activity[];
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
        <span className={`text-[11px] font-semibold text-white border border-[rgba(255,255,255,0.32)] rounded-[7px] py-1 px-[9px] whitespace-nowrap ${
            closed ? 'bg-[#546675]' : urgent ? 'bg-[#e33f3f]' : 'bg-[rgba(9,20,40,0.42)]'
        }`}>
            {closed ? 'Đã đóng' : `${days} ngày`}
        </span>
    );
}

function ActivityCard({ activity, index, onClick }: ActivityCardProps) {
    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={activity.name}
            style={{ ...accentVars(activity.topic), '--d': `${index * 60}ms` } as CSSProperties}
            className="bg-glass border border-border rounded-2xl overflow-hidden cursor-pointer
                       [transition:transform_0.3s_cubic-bezier(0.16,1,0.3,1),box-shadow_0.3s,border-color_0.3s]
                       [box-shadow:0_2px_8px_rgba(20,44,68,0.07)]
                       animate-[fadeUp_0.5s_cubic-bezier(0.16,1,0.3,1)_var(--d)_both]
                       hover:-translate-y-[3px] hover:border-[var(--topic)]
                       hover:[box-shadow:0_18px_40px_rgba(20,44,68,0.16),0_0_0_1px_var(--topic),0_0_24px_var(--topic-27)]"
            onClick={onClick}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
        >
            {/* bg tint shows only while the photo loads */}
            <div className="aspect-[3/2] bg-[var(--topic-13)] p-[13px] flex items-start justify-between relative overflow-hidden">
                <ActivityImage
                    src={activity.image}
                    alt={activity.name}
                    position={activity.image_position}
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0.05)_60%,rgba(0,0,0,0.18)_100%)]" />
                <span className="relative z-[1] text-[10.5px] font-bold text-white uppercase tracking-[0.05em] bg-[rgba(9,20,40,0.34)] border border-[rgba(255,255,255,0.32)] rounded-[7px] py-1 px-[9px]">
                    {activity.category}
                </span>
                <div className="relative z-[1]">
                    <DaysBadge iso={activity.deadline} />
                </div>
            </div>

            <div className="pt-4 px-[17px] pb-[17px] flex flex-col gap-[11px]">
                <h3 className="font-heading font-bold text-[16px] leading-[1.3] tracking-[-0.005em] text-text m-0 line-clamp-2 min-h-[41.6px]">
                    {activity.name}
                </h3>

                <div className="flex gap-3.5 flex-wrap">
                    {activity.location && (
                        <span className="flex items-center gap-1 text-[13px] text-text-dim">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1C4.8 1 3 2.8 3 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" stroke="var(--color-primary)" strokeWidth="1.3"/><circle cx="7" cy="5" r="1.5" stroke="var(--color-primary)" strokeWidth="1.3"/></svg>
                            {activity.location}
                        </span>
                    )}
                    {activity.deadline && (
                        <span className="flex items-center gap-1 text-[13px] text-text-dim">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="var(--color-primary)" strokeWidth="1.3"/><path d="M7 4.5v2.8l1.8 1.8" stroke="var(--color-primary)" strokeWidth="1.3" strokeLinecap="round"/></svg>
                            {formatDeadlineDisplay(activity.deadline)}
                        </span>
                    )}
                </div>

                {(activity.topic || activity.subtopic) && (
                    <div className="flex gap-1.5 flex-wrap">
                        {activity.topic && (
                            <span className="text-[12px] font-semibold py-[3px] px-2.5 rounded-full bg-[var(--topic-13)] text-[var(--topic)] border border-[var(--topic-27)]">{activity.topic}</span>
                        )}
                        {activity.subtopic && (
                            <span className="text-[12px] font-medium py-[3px] px-2.5 rounded-full bg-[var(--topic-07)] text-[var(--topic)] border border-[var(--topic-20)]">{activity.subtopic}</span>
                        )}
                    </div>
                )}

                {activity.positions?.length > 0 && (
                    <div className="border-t border-border pt-2.5 mt-0.5 text-[12px] text-text-faint">
                        <span className="font-semibold tracking-[0.06em] uppercase text-[11.5px]">Vị trí: </span>
                        <span className="text-accent-2 font-medium text-[12.5px]">
                            {activity.positions.join(' · ')}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

// modal that pops up when an activity card is clicked 
function DetailModal({ activity, onClose }: DetailModalProps) {
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
            className="fixed inset-0 bg-[rgba(18,40,62,0.5)] z-50 flex items-center justify-center py-5 px-4"
            onClick={onClose}
        >
            <div
                style={accentVars(activity.topic)}
                className="bg-glass rounded-[22px] max-w-[620px] w-full shadow-[0_30px_80px_rgba(20,44,68,0.3)] overflow-hidden animate-[fadeUp_0.25s_ease_both] max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* bg tint shows only while the photo loads */}
                <div className="aspect-[3/2] bg-[var(--topic-13)] py-6 px-[26px] flex flex-col justify-between relative overflow-hidden">
                    <ActivityImage
                        src={activity.image}
                        alt={activity.name}
                        position={activity.image_position}
                    />
                    {/* Dark scrim so the category label and close button stay readable over any photo */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.12)_55%,rgba(0,0,0,0.30)_100%)]" />
                    <button
                        type="button"
                        aria-label="Đóng"
                        onClick={onClose}
                        className="absolute top-4 right-4 w-9 h-9 rounded-[10px] border border-[rgba(255,255,255,0.3)] bg-[rgba(10,20,32,0.55)] cursor-pointer flex items-center justify-center text-white"
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M4 4l10 10M14 4L4 14" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                    </button>
                    <span className="relative z-[1] self-start text-[11.5px] font-bold text-white tracking-[0.08em] uppercase bg-[rgba(9,20,40,0.42)] border border-[rgba(255,255,255,0.3)] rounded-lg py-[5px] px-[11px]">
                        {activity.category}
                    </span>
                </div>

                <div className="pt-[26px] px-7 pb-[30px] flex flex-col gap-5">
                    <h2 className="font-heading font-extrabold text-[27px] leading-[1.2] text-text tracking-[-0.02em] m-0">
                        {activity.name}
                    </h2>

                    <div className="flex gap-5 flex-wrap">
                        {([
                            { label: 'ĐỊA ĐIỂM', value: activity.location, icon: <svg width="15" height="15" viewBox="0 0 14 14" fill="none"><path d="M7 1C4.8 1 3 2.8 3 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" stroke="var(--color-primary)" strokeWidth="1.3"/><circle cx="7" cy="5" r="1.5" stroke="var(--color-primary)" strokeWidth="1.3"/></svg> },
                            { label: 'HẠN ĐĂNG KÝ', value: formatDeadlineDisplay(activity.deadline), icon: <svg width="15" height="15" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="var(--color-primary)" strokeWidth="1.3"/><path d="M7 4.5v2.8l1.8 1.8" stroke="var(--color-primary)" strokeWidth="1.3" strokeLinecap="round"/></svg> },
                            { label: 'CHỦ ĐỀ', value: activity.topic, icon: null },
                        ] as { label: string; value: string; icon: React.ReactNode }[]).filter(m => m.value).map(meta => (
                            <div key={meta.label} className="flex flex-col gap-1">
                                <span className="text-[11.5px] text-text-faint uppercase tracking-[0.06em] font-semibold">{meta.label}</span>
                                <span className="flex items-center gap-[5px] text-[14px] text-text">
                                    {meta.icon}{meta.value}
                                </span>
                            </div>
                        ))}
                    </div>

                    {activity.desc && (
                        <p className="text-[15px] leading-[1.72] text-text-dim m-0">
                            {activity.desc}
                        </p>
                    )}

                    {(activity.topic || activity.subtopic) && (
                        <div>
                            <span className="text-[11.5px] font-semibold text-text-faint uppercase tracking-[0.06em] block mb-2">Thẻ</span>
                            <div className="flex gap-[7px] flex-wrap">
                                {activity.topic && <span className="text-[13px] font-semibold py-[5px] px-3 rounded-full bg-[var(--topic-13)] text-[var(--topic)] border border-[var(--topic-27)]">{activity.topic}</span>}
                                {activity.subtopic && <span className="text-[13px] font-medium py-[5px] px-3 rounded-full bg-[var(--topic-07)] text-[var(--topic)] border border-[var(--topic-20)]">{activity.subtopic}</span>}
                            </div>
                        </div>
                    )}

                    {activity.positions?.length > 0 && (
                        <div>
                            <span className="text-[11.5px] font-semibold text-text-faint uppercase tracking-[0.06em] block mb-2">Vị trí tuyển</span>
                            <div className="flex gap-2 flex-wrap">
                                {activity.positions.map(p => (
                                    <span key={p} className="text-[13px] text-text py-1.5 px-3 rounded-lg bg-[rgba(47,123,255,0.12)] border border-[rgba(47,123,255,0.2)]">{p}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <a
                        href={activity.link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2.5 bg-primary text-white p-[15px] rounded-full no-underline font-medium text-[15px] tracking-[0.02em] shadow-[0_10px_26px_rgba(26,111,208,0.28)]"
                    >
                        Đăng ký ngay
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M4 9h10M10 5l4 4-4 4" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}

function ActivityCards({
    activities,
    searchQuery = '',
    topicFilters = EMPTY_TOPIC_FILTER,
    categoryFilter = '',
    deadlineFilter = '',
    positionFilters = EMPTY_POSITIONS,
    onResultCountChange,
    onPageInfoChange,
}: ActivityCardsProps) {
    const [currentPage, setCurrentPage] = useState<number>(0);

    // set the modal state to the activity when its card is clicked 
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

    const filtered = filterActivities(activities, { searchQuery, categoryFilter, deadlineFilter, topicFilters, positionFilters });
    const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);

    useEffect(() => { setCurrentPage(0); }, [searchQuery, categoryFilter, deadlineFilter, topicFilters, positionFilters]);
    useEffect(() => { onResultCountChange?.(filtered.length); }, [filtered.length, onResultCountChange]);
    useEffect(() => { onPageInfoChange?.(currentPage, totalPages); }, [currentPage, totalPages, onPageInfoChange]);

    const paged = filtered.slice(currentPage * CARDS_PER_PAGE, (currentPage + 1) * CARDS_PER_PAGE);

    return (
        <div>
            {filtered.length === 0 ? (
                <div className="bg-glass border border-border rounded-[18px] py-12 px-8 text-center">
                    <p className="font-heading font-bold text-[20px] text-text mb-2">
                        Không tìm thấy hoạt động
                    </p>
                    <p className="text-[14px] text-text-faint">
                        Thử điều chỉnh bộ lọc hoặc từ khoá tìm kiếm.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(232px,1fr))] gap-[18px]">
                        {paged.map((activity, i) => (
                            <ActivityCard
                                key={activity.id}
                                activity={activity}
                                index={i}
                                // this gives the activity's data to the modal when the card is clicked
                                onClick={() => setSelectedActivity(activity)}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-1.5 mt-7">
                            <button
                                type="button"
                                aria-label="Trang trước"
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                                className={`py-[7px] px-[13px] rounded-[9px] border border-border bg-glass font-semibold text-[14px] text-text-dim ${
                                    currentPage === 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'
                                }`}
                            >←</button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    type="button"
                                    key={i}
                                    aria-label={`Trang ${i + 1}`}
                                    aria-current={i === currentPage ? 'page' : undefined}
                                    onClick={() => setCurrentPage(i)}
                                    className={`py-[7px] px-[13px] rounded-[9px] border border-border text-[14px] cursor-pointer ${
                                        i === currentPage ? 'bg-primary text-white font-bold' : 'bg-glass text-text-dim font-normal'
                                    }`}
                                >{i + 1}</button>
                            ))}
                            <button
                                type="button"
                                aria-label="Trang sau"
                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={currentPage === totalPages - 1}
                                className={`py-[7px] px-[13px] rounded-[9px] border border-border bg-glass font-semibold text-[14px] text-text-dim ${
                                    currentPage === totalPages - 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'
                                }`}
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
