import type { DeadlineFilter, TopicFilter } from '../types';
import FilterSections from './FilterSections';

interface FilterRailProps {
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

function FilterRail({
    categoryFilter, onCategoryChange,
    deadlineFilter, onDeadlineChange,
    topicFilters, setTopicFilters,
    positionFilters, onPositionFilterChange,
    onClearAll,
}: FilterRailProps) {
    const hasAnyFilter = categoryFilter || deadlineFilter ||
        topicFilters.topics.length > 0 || positionFilters.length > 0;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            position: 'sticky',
            top: 82,
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
            width: 238,
            paddingRight: 4,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Bộ lọc</span>
                {hasAnyFilter && (
                    <button onClick={onClearAll} style={{
                        fontFamily: 'Be Vietnam Pro, sans-serif',
                        fontSize: 13,
                        color: 'var(--primary)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0,
                    }}>Xoá tất cả</button>
                )}
            </div>

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
    );
}

export default FilterRail;
