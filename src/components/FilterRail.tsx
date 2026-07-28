import type { Activity, DeadlineFilter, TopicFilter } from '../types';
import FilterSections from './FilterSections';

interface FilterRailProps {
    activities: Activity[];
    categoryFilter: string;
    onCategoryChange: (cat: string) => void;
    deadlineFilter: DeadlineFilter;
    onDeadlineChange: (d: DeadlineFilter) => void;
    topicFilters: TopicFilter;
    setTopicFilters: (f: TopicFilter) => void;
    positionFilters: string[];
    onPositionFilterChange: (p: string[]) => void;
    onClearAll: () => void;
    className?: string;
}

function FilterRail({
    activities,
    categoryFilter, onCategoryChange,
    deadlineFilter, onDeadlineChange,
    topicFilters, setTopicFilters,
    positionFilters, onPositionFilterChange,
    onClearAll,
    className = 'flex',
}: FilterRailProps) {
    const hasAnyFilter = categoryFilter || deadlineFilter ||
        topicFilters.topics.length > 0 || positionFilters.length > 0;

    return (
        <div className={`flex flex-col gap-5 sticky top-[82px] max-h-[calc(100vh-100px)] overflow-y-auto w-[238px] pr-1 ${className}`}>
            <div className="flex justify-between items-center">
                <span className="font-heading font-bold text-[15px] text-text">Bộ lọc</span>
                {hasAnyFilter && (
                    <button
                        type="button"
                        onClick={onClearAll}
                        className="text-[13px] text-primary bg-transparent border-none p-0 cursor-pointer underline"
                    >Xoá tất cả</button>
                )}
            </div>

            <FilterSections
                activities={activities}
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
