import { useState, useEffect } from 'react';
import FilterRail from './FilterLeft';
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
    const [isHorizontal, setIsHorizontal] = useState<boolean>(window.innerWidth <= 1080);
    const [resultCount, setResultCount] = useState<number>(0);

    useEffect(() => {
        function onResize(): void { setIsHorizontal(window.innerWidth <= 1080); }
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // suppress unused warning — resultCount feeds future search bar badge
    void resultCount;

    const hasFilters = categoryFilter || deadlineFilter ||
        topicFilters.topics.length > 0 || positionFilters.length > 0 || searchQuery;

    return (
        <div id="ecMain" style={{ maxWidth: 1320, margin: '0 auto', padding: '8px 40px 80px' }}>
            <h2 style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: '-0.02em',
                color: 'var(--text)',
                marginBottom: 20,
            }}>
                {hasFilters ? 'Kết quả lọc' : 'Tất cả hoạt động'}
            </h2>

            <div style={isHorizontal ? {
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
            } : {
                display: 'grid',
                gridTemplateColumns: '238px 1fr',
                gap: 34,
                alignItems: 'start',
            }}>
                <FilterRail
                    categoryFilter={categoryFilter}
                    onCategoryChange={setCategoryFilter}
                    deadlineFilter={deadlineFilter}
                    onDeadlineChange={setDeadlineFilter}
                    topicFilters={topicFilters}
                    setTopicFilters={setTopicFilters}
                    positionFilters={positionFilters}
                    onPositionFilterChange={setPositionFilters}
                    onClearAll={onClearAll}
                    isHorizontal={isHorizontal}
                />

                <ActivityCards
                    searchQuery={searchQuery}
                    topicFilters={topicFilters}
                    categoryFilter={categoryFilter}
                    deadlineFilter={deadlineFilter}
                    positionFilters={positionFilters}
                    onResultCountChange={setResultCount}
                />
            </div>
        </div>
    );
}

export default MainContent;
