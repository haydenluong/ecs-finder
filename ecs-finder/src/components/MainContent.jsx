import { useState } from 'react';
import FilterLeft from './FilterLeft';
import FilterRight from './FilterRight';
import ActivityCards from './ActivityCards';
import SearchBar from './SearchBar';
import MobileFilterOverlay from './MobileFilterOverlay';

function MainContent({ topicFilters, setTopicFilters, categoryFilter, setCategoryFilter, deadlineFilter, setDeadlineFilter, positionFilters, setPositionFilters }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const activeFilterCount =
        (categoryFilter ? 1 : 0) +
        (deadlineFilter ? 1 : 0) +
        topicFilters.topics.length +
        positionFilters.length;

    const handleTopicFilterChange = (filters) => {
        setTopicFilters(filters);
    };

    const handleCategoryFilterChange = (category) => {
        setCategoryFilter(category);
    };

    const handleDeadlineFilterChange = (deadline) => {
        setDeadlineFilter(deadline);
    };

    const handlePositionFilterChange = (positions) => {
        setPositionFilters(positions);
    };

    return (
        <>
            {/* ── DESKTOP ONLY ─────────────────────────── */}
            <div className="hidden md:block">
                <SearchBar onSearch={setSearchQuery} />
                <div className="grid grid-cols-[300px_1fr_300px] gap-8 py-8">
                    <FilterLeft 
                        onCategoryChange={handleCategoryFilterChange}
                        onDeadlineChange={handleDeadlineFilterChange}
                        selectedCategory={categoryFilter}
                        selectedDeadline={deadlineFilter}
                    />
                    <div>
                        <ActivityCards 
                            searchQuery={searchQuery} 
                            topicFilters={topicFilters}
                            categoryFilter={categoryFilter}
                            deadlineFilter={deadlineFilter}
                            positionFilters={positionFilters}
                        />
                    </div>
                    <FilterRight 
                        onTopicFilterChange={handleTopicFilterChange}
                        onPositionFilterChange={handlePositionFilterChange}
                        topicFilters={topicFilters}
                    />
                </div>
            </div>

            {/* ── MOBILE ONLY ──────────────────────────── */}
            <div className="block md:hidden px-4 py-4">
                <SearchBar onSearch={setSearchQuery} />

                <div className="flex justify-center my-3">
                    <button
                        className="flex items-center gap-2 px-5 py-2 rounded-full bg-white shadow-md border border-gray-200 font-semibold text-gray-700 hover:shadow-lg transition-all"
                        onClick={() => setIsMobileFilterOpen(true)}
                    >
                        <span>⚙️ Bộ lọc</span>
                        {activeFilterCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {isMobileFilterOpen && (
                    <MobileFilterOverlay
                        onClose={() => setIsMobileFilterOpen(false)}
                        categoryFilter={categoryFilter}
                        onCategoryChange={handleCategoryFilterChange}
                        deadlineFilter={deadlineFilter}
                        onDeadlineChange={handleDeadlineFilterChange}
                        topicFilters={topicFilters}
                        onTopicFilterChange={handleTopicFilterChange}
                        positionFilters={positionFilters}
                        onPositionFilterChange={handlePositionFilterChange}
                    />
                )}

                <ActivityCards
                    searchQuery={searchQuery}
                    topicFilters={topicFilters}
                    categoryFilter={categoryFilter}
                    deadlineFilter={deadlineFilter}
                    positionFilters={positionFilters}
                />
            </div>
        </>
    );
}

export default MainContent;

// User selects a filter in FilterLeft or FilterRight.
// Filter component calls the handler function (passed as a prop) to notify MainContent of the change.
// MainContent updates its state using the handler function (e.g., setCategoryFilter, setDeadlineFilter, etc.).
// MainContent passes the updated filter values as props to ActivityCards.
// ActivityCards receives the new values and displays the filtered activities accordingly.