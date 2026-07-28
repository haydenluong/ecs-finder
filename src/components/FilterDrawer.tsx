import { useEffect } from 'react';
import type { DeadlineFilter, TopicFilter } from '../types';
import FilterSections from './FilterSections';

interface FilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    resultCount: number;
    categoryFilter: string;
    onCategoryChange: (cat: string) => void;
    deadlineFilter: DeadlineFilter;
    onDeadlineChange: (d: DeadlineFilter) => void;
    topicFilters: TopicFilter;
    setTopicFilters: (f: TopicFilter) => void;
    positionFilters: string[];
    onPositionFilterChange: (p: string[]) => void;
    onClearAll: () => void;
}

function FilterDrawer({
    isOpen, onClose, resultCount,
    categoryFilter, onCategoryChange,
    deadlineFilter, onDeadlineChange,
    topicFilters, setTopicFilters,
    positionFilters, onPositionFilterChange,
    onClearAll,
}: FilterDrawerProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            function onKey(e: KeyboardEvent): void { if (e.key === 'Escape') onClose(); }
            window.addEventListener('keydown', onKey);
            return () => {
                document.body.style.overflow = '';
                window.removeEventListener('keydown', onKey);
            };
        } else {
            document.body.style.overflow = '';
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const hasAnyFilter = categoryFilter || deadlineFilter ||
        topicFilters.topics.length > 0 || positionFilters.length > 0;

    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col justify-end bg-[rgba(18,40,62,0.5)]"
            onClick={onClose}
        >
            <div
                className="flex flex-col bg-glass rounded-t-[22px] max-h-[82vh] animate-sheet-up"
                onClick={e => e.stopPropagation()}
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-9 h-1 rounded-full bg-[rgba(20,52,80,0.18)]" />
                </div>

                {/* Header */}
                <div className="flex justify-between items-center pt-2 px-5 pb-3 border-b border-border shrink-0">
                    <span className="font-heading font-bold text-[16px] text-text">Bộ lọc</span>
                    {hasAnyFilter && (
                        <button
                            type="button"
                            onClick={onClearAll}
                            className="text-[13px] text-primary bg-transparent border-none p-0 cursor-pointer underline"
                        >Xoá tất cả</button>
                    )}
                </div>

                {/* Scrollable filter content */}
                <div className="overflow-y-auto flex-1 px-4">
                    <FilterSections
                        categoryFilter={categoryFilter}
                        onCategoryChange={onCategoryChange}
                        deadlineFilter={deadlineFilter}
                        onDeadlineChange={onDeadlineChange}
                        topicFilters={topicFilters}
                        setTopicFilters={setTopicFilters}
                        positionFilters={positionFilters}
                        onPositionFilterChange={onPositionFilterChange}
                    />
                </div>

                {/* Sticky footer */}
                <div className="py-3 px-4 border-t border-border bg-glass shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3.5 px-5 rounded-full border-none bg-primary text-white font-semibold text-[15px] cursor-pointer tracking-[0.02em] shadow-[0_6px_20px_rgba(26,111,208,0.28)]"
                    >
                        Xem {resultCount} kết quả
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FilterDrawer;
