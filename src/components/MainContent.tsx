import { useState, useEffect, useCallback } from 'react';
import FilterRail from './FilterLeft';
import FilterDrawer from './FilterDrawer';
import ActivityCards from './ActivityCards';
import type { TopicFilter, DeadlineFilter } from '../types';

interface MainContentProps {
  searchQuery: string;
  topicFilters: TopicFilter;
  setTopicFilters: (f: TopicFilter) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  deadlineFilter: DeadlineFilter;
  setDeadlineFilter: (d: DeadlineFilter) => void;
  positionFilters: string[];
  setPositionFilters: (p: string[]) => void;
  onClearAll: () => void;
}

function MainContent({
    searchQuery,
    topicFilters, setTopicFilters,
    categoryFilter, setCategoryFilter,
    deadlineFilter, setDeadlineFilter,
    positionFilters, setPositionFilters,
    onClearAll,
}: MainContentProps) {
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [resultCount, setResultCount] = useState<number>(0);
    const [pageInfo, setPageInfo] = useState<{ page: number; total: number }>({ page: 0, total: 1 });

    useEffect(() => {
        const mq = window.matchMedia('(width >= 1081px)');
        function closeIfWide(): void { if (mq.matches) setDrawerOpen(false); }
        mq.addEventListener('change', closeIfWide);
        return () => mq.removeEventListener('change', closeIfWide);
    }, []);

    // Bail out when the values are unchanged — a fresh object literal here would
    // re-render on every call and re-trigger the effect in ActivityCards forever.
    const handlePageInfoChange = useCallback((page: number, total: number) => {
        setPageInfo(prev => (prev.page === page && prev.total === total ? prev : { page, total }));
    }, []);

    const activeFilterCount =
        (categoryFilter ? 1 : 0) +
        (deadlineFilter ? 1 : 0) +
        topicFilters.topics.length +
        topicFilters.subtopics.length +
        positionFilters.length;

    const hasFilters = activeFilterCount > 0 || searchQuery;

    const sharedFilterProps = {
        categoryFilter,
        onCategoryChange: setCategoryFilter,
        deadlineFilter,
        onDeadlineChange: setDeadlineFilter,
        topicFilters,
        setTopicFilters,
        positionFilters,
        onPositionFilterChange: setPositionFilters,
        onClearAll,
    };

    return (
        <div className="max-w-[1320px] mx-auto pt-2 px-4 pb-20 rail:px-10">
            <div className="flex mb-[14px] rail:hidden">
                <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className={`flex items-center gap-[7px] py-[9px] px-4 rounded-full border-[1.5px] cursor-pointer font-semibold text-[14px] shrink-0 min-h-[44px] ${
                        activeFilterCount > 0
                            ? 'border-primary bg-[rgba(26,111,208,0.08)] text-primary'
                            : 'border-border-bright bg-glass text-text-dim'
                    }`}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="2" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Bộ lọc
                    {activeFilterCount > 0 && (
                        <span className="bg-primary text-white rounded-full text-[11px] font-bold py-px px-[7px] min-w-5 text-center">{activeFilterCount}</span>
                    )}
                </button>
            </div>

            <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading font-bold text-[22px] tracking-[-0.02em] text-text m-0">
                    {hasFilters ? 'Kết quả lọc' : 'Tất cả hoạt động'}
                </h2>

                {pageInfo.total > 1 && (
                    <span className="text-[13px] text-text-faint font-medium shrink-0">
                        Trang {pageInfo.page + 1}/{pageInfo.total}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 gap-[34px] items-start rail:grid-cols-[238px_1fr]">
                <FilterRail {...sharedFilterProps} className="hidden rail:flex" />
                <ActivityCards
                    searchQuery={searchQuery}
                    topicFilters={topicFilters}
                    categoryFilter={categoryFilter}
                    deadlineFilter={deadlineFilter}
                    positionFilters={positionFilters}
                    onResultCountChange={setResultCount}
                    onPageInfoChange={handlePageInfoChange}
                />
            </div>

            <FilterDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                resultCount={resultCount}
                {...sharedFilterProps}
            />
        </div>
    );
}

export default MainContent;
