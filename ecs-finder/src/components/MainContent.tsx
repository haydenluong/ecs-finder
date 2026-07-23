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
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 1080);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [resultCount, setResultCount] = useState<number>(0);
    const [pageInfo, setPageInfo] = useState<{ page: number; total: number }>({ page: 0, total: 1 });

    useEffect(() => {
        function onResize(): void { setIsMobile(window.innerWidth <= 1080); }
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
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
        <div id="ecMain" style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '8px 16px 80px' : '8px 40px 80px' }}>
            {isMobile && (
                <div style={{ display: 'flex', marginBottom: 14 }}>
                    <button
                        onClick={() => setDrawerOpen(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 7,
                            padding: '9px 16px',
                            borderRadius: 999,
                            border: activeFilterCount > 0 ? '1.5px solid var(--primary)' : '1.5px solid var(--border-bright)',
                            background: activeFilterCount > 0 ? 'rgba(26,111,208,0.08)' : 'var(--glass)',
                            cursor: 'pointer',
                            fontFamily: 'Be Vietnam Pro, sans-serif',
                            fontWeight: 600,
                            fontSize: 14,
                            color: activeFilterCount > 0 ? 'var(--primary)' : 'var(--text-dim)',
                            flexShrink: 0,
                            minHeight: 44,
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            <line x1="2" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        Bộ lọc
                        {activeFilterCount > 0 && (
                            <span style={{
                                background: 'var(--primary)',
                                color: 'white',
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '1px 7px',
                                minWidth: 20,
                                textAlign: 'center',
                            }}>{activeFilterCount}</span>
                        )}
                    </button>
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    fontSize: 22,
                    letterSpacing: '-0.02em',
                    color: 'var(--text)',
                    margin: 0,
                }}>
                    {hasFilters ? 'Kết quả lọc' : 'Tất cả hoạt động'}
                </h2>

                {pageInfo.total > 1 && (
                    <span style={{
                        fontFamily: 'Be Vietnam Pro, sans-serif',
                        fontSize: 13,
                        color: 'var(--text-faint)',
                        fontWeight: 500,
                        flexShrink: 0,
                    }}>
                        Trang {pageInfo.page + 1}/{pageInfo.total}
                    </span>
                )}
            </div>

            {isMobile ? (
                <ActivityCards
                    searchQuery={searchQuery}
                    topicFilters={topicFilters}
                    categoryFilter={categoryFilter}
                    deadlineFilter={deadlineFilter}
                    positionFilters={positionFilters}
                    onResultCountChange={setResultCount}
                    onPageInfoChange={handlePageInfoChange}
                />
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '238px 1fr',
                    gap: 34,
                    alignItems: 'start',
                }}>
                    <FilterRail {...sharedFilterProps} />
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
            )}

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
