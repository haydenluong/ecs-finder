import { useState, useEffect, useCallback, useRef } from 'react';
import FilterRail from './FilterRail';
import FilterDrawer from './FilterDrawer';
import ActivityCards from './ActivityCards';
import { useLang } from '@/i18n/LangProvider';
import type { Activity, TopicFilter, DeadlineFilter } from '../types';

const NUDGE_CLASS = 'animate-filter-nudge';
const TAP_HAND_CLASS = 'animate-tap-hand';

interface MainContentProps {  
  searchQuery: string;
  activities: Activity[];
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
    activities,
    topicFilters, setTopicFilters,
    categoryFilter, setCategoryFilter,
    deadlineFilter, setDeadlineFilter,
    positionFilters, setPositionFilters,
    onClearAll,
}: MainContentProps) {
    const { t } = useLang();
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [resultCount, setResultCount] = useState<number>(0);
    const [pageInfo, setPageInfo] = useState<{ page: number; total: number }>({ page: 0, total: 1 });
    const filterButtonRef = useRef<HTMLButtonElement>(null);
    const tapHandRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const mq = window.matchMedia('(width >= 1081px)');
        function closeIfWide(): void { if (mq.matches) setDrawerOpen(false); }
        mq.addEventListener('change', closeIfWide);
        return () => mq.removeEventListener('change', closeIfWide);
    }, []);

    useEffect(() => {
        const button = filterButtonRef.current;
        if (!button || !window.matchMedia('(width < 1081px)').matches) return;
        const hand = tapHandRef.current;
        button.classList.add(NUDGE_CLASS);
        hand?.classList.add(TAP_HAND_CLASS);
        const id = setTimeout(() => {
            button.classList.remove(NUDGE_CLASS);
            hand?.classList.remove(TAP_HAND_CLASS);
        }, 2600);
        return () => clearTimeout(id);
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
        activities,
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
            <div className="relative flex mb-[14px] rail:hidden">
                <button
                    type="button"
                    ref={filterButtonRef}
                    onClick={() => setDrawerOpen(true)}
                    className="flex items-center justify-center gap-[9px] w-full py-[13px] px-4 rounded-full cursor-pointer font-semibold text-[15px] min-h-[48px] bg-primary text-white shadow-[0_4px_14px_rgba(26,111,208,0.3)]"
                >
                    <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                        <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="2" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {t('filters.title')}
                    {activeFilterCount > 0 && (
                        <span className="bg-white text-primary rounded-full text-[11px] font-bold py-px px-[7px] min-w-5 text-center">{activeFilterCount}</span>
                    )}
                </button>
                <svg
                    ref={tapHandRef}
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="pointer-events-none absolute right-7 top-[17px] w-[34px] h-[34px] opacity-0 z-10 origin-top drop-shadow-[0_3px_5px_rgba(11,53,90,0.45)]"
                >
                    <path
                        fill="#ffffff"
                        stroke="var(--color-primary-2)"
                        strokeWidth="0.7"
                        strokeLinejoin="round"
                        d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"
                    />
                </svg>
            </div>

            <div className="flex items-end justify-between gap-3 mb-5">
                <div className="flex items-center gap-3 flex-wrap min-w-0">
                    <h2 className="font-heading font-bold text-[22px] tracking-[-0.02em] text-text m-0">
                        {t(hasFilters ? 'results.filtered' : 'results.all')}
                    </h2>
                    <span className="flex items-center gap-2 font-heading text-[11px] font-bold uppercase tracking-[0.11em] text-text-faint">
                        <span aria-hidden="true" className="h-[2px] w-[18px] rounded-full bg-primary shrink-0" />
                        {t('results.openCount', { count: resultCount })}
                    </span>
                </div>

                {pageInfo.total > 1 && (
                    <span className="text-[13px] text-text-faint font-medium shrink-0">
                        {t('results.page', { page: pageInfo.page + 1, total: pageInfo.total })}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 gap-[34px] items-start rail:grid-cols-[238px_1fr]">
                <FilterRail {...sharedFilterProps} className="hidden rail:flex" />
                <ActivityCards
                    activities = {activities}
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
