import { useState, type CSSProperties, type DragEvent } from 'react';
import { daysLeft } from '@/data/Activities';
import { accentVars } from '@/data/tagData';
import ActivityImage from '@/components/ActivityImage';
import type { ImagePosition } from '@/types';

interface PreviewCardProps {
    name: string;
    category: string;
    topic: string;
    subtopic: string | null;
    location: string;
    deadline: string;
    positions: string[];
    image: string;
    imagePosition?: ImagePosition | null;
    className?: string;
    onFileSelect?: (file: File) => void;
    onBrowse?: () => void;
}

function formatDeadlineDisplay(iso: string): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
}

function DaysBadge({ iso }: { iso: string }) {
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

export default function PreviewCard({
    name, category, topic, subtopic, location, deadline, positions, image, imagePosition,
    className = '', onFileSelect, onBrowse,
}: PreviewCardProps) {
    const [failedUrl, setFailedUrl] = useState('');
    const decodeFailed = image !== '' && failedUrl === image;

    const [dragOver, setDragOver] = useState(false);
    const [tooManyFiles, setTooManyFiles] = useState(false);

    function handleDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragOver(false);
        const files = e.dataTransfer.files;
        if (!files || files.length === 0) return;
        setTooManyFiles(files.length > 1);
        onFileSelect?.(files[0]);
    }

    const dropHandlers = onFileSelect
        ? {
            onDragOver: (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragOver(true); },
            onDragLeave: () => setDragOver(false),
            onDrop: handleDrop,
        }
        : {};

    return (
        <div
            style={accentVars(topic) as CSSProperties}
            className={`bg-glass border border-border rounded-2xl overflow-hidden ${className}`}
        >
            <div className="aspect-[3/2] bg-[var(--topic-13)] p-[13px] flex items-start justify-between relative overflow-hidden">
                {image && !decodeFailed ? (
                    <ActivityImage
                        src={image}
                        alt={name}
                        position={imagePosition}
                        onError={() => setFailedUrl(image)}
                    />
                ) : (
                    <div
                        {...dropHandlers}
                        onClick={onBrowse}
                        onKeyDown={e => { if (onBrowse && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onBrowse(); } }}
                        role={onBrowse ? 'button' : undefined}
                        tabIndex={onBrowse ? 0 : undefined}
                        className={`absolute inset-0 z-[2] flex flex-col items-center justify-center gap-1 border-2 border-dashed m-1.5 rounded-xl transition-colors duration-150 ${
                            onBrowse ? 'cursor-pointer hover:border-primary hover:bg-[rgba(26,111,208,0.04)]' : ''
                        } ${
                            dragOver ? 'border-primary bg-[rgba(26,111,208,0.06)]' : 'border-text-faint/40'
                        }`}
                    >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-text-faint">
                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                            <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {decodeFailed ? (
                            <span className="text-[12px] text-text-faint px-3 text-center">Không thể xem trước ảnh này</span>
                        ) : onBrowse && (
                            <span className="text-[12px] text-text-faint px-3 text-center">
                                Nhấn hoặc kéo ảnh vào đây
                            </span>
                        )}
                        {tooManyFiles && (
                            <span className="text-[11px] text-red-600 px-3 text-center">Chỉ có thể tải lên 1 ảnh</span>
                        )}
                    </div>
                )}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0.05)_60%,rgba(0,0,0,0.18)_100%)]" />
                <span className={`relative z-[1] text-[10.5px] font-bold uppercase tracking-[0.05em] rounded-[7px] py-1 px-[9px] border ${
                    category
                        ? 'text-white bg-[rgba(9,20,40,0.34)] border-[rgba(255,255,255,0.32)]'
                        : 'text-text-faint bg-[rgba(255,255,255,0.5)] border-dashed border-text-faint/40'
                }`}>
                    {category || 'Loại hình'}
                </span>
                <div className="relative z-[1]">
                    {deadline && <DaysBadge iso={deadline} />}
                </div>
            </div>

            <div className="pt-4 px-[17px] pb-[17px] flex flex-col gap-[11px]">
                <h3 className="font-heading font-bold text-[16px] leading-[1.3] tracking-[-0.005em] text-text m-0 line-clamp-2 min-h-[41.6px]">
                    {name || <span className="text-text-faint font-normal">Tên hoạt động của bạn...</span>}
                </h3>

                <div className="flex gap-3.5 flex-wrap">
                    <span className={`flex items-center gap-1 text-[13px] ${location ? 'text-text-dim' : 'text-text-faint'}`}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1C4.8 1 3 2.8 3 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" stroke={location ? 'var(--color-primary)' : 'var(--color-text-faint)'} strokeWidth="1.3"/><circle cx="7" cy="5" r="1.5" stroke={location ? 'var(--color-primary)' : 'var(--color-text-faint)'} strokeWidth="1.3"/></svg>
                        {location || 'Địa điểm'}
                    </span>
                    <span className={`flex items-center gap-1 text-[13px] ${deadline ? 'text-text-dim' : 'text-text-faint'}`}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke={deadline ? 'var(--color-primary)' : 'var(--color-text-faint)'} strokeWidth="1.3"/><path d="M7 4.5v2.8l1.8 1.8" stroke={deadline ? 'var(--color-primary)' : 'var(--color-text-faint)'} strokeWidth="1.3" strokeLinecap="round"/></svg>
                        {deadline ? formatDeadlineDisplay(deadline) : 'Hạn nộp'}
                    </span>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                    <span className={`text-[12px] font-semibold py-[3px] px-2.5 rounded-full ${
                        topic
                            ? 'bg-[var(--topic-13)] text-[var(--topic)] border border-[var(--topic-27)]'
                            : 'text-text-faint border border-dashed border-text-faint/40'
                    }`}>
                        {topic || 'Chủ đề'}
                    </span>
                    {topic && subtopic && (
                        <span className="text-[12px] font-medium py-[3px] px-2.5 rounded-full bg-[var(--topic-07)] text-[var(--topic)] border border-[var(--topic-20)]">{subtopic}</span>
                    )}
                </div>

                {positions.length > 0 && (
                    <div className="border-t border-border pt-2.5 mt-0.5 text-[12px] text-text-faint">
                        <span className="font-semibold tracking-[0.06em] uppercase text-[11.5px]">Vị trí: </span>
                        <span className="text-accent-2 font-medium text-[12.5px]">
                            {positions.join(' · ')}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
