import { useState } from 'react';
import FilterLeft from './FilterLeft';
import FilterRight from './FilterRight';
import ActivityCards from './ActivityCards';
import SearchBar from './SearchBar';

function MainContent() {
    const [searchQuery, setSearchQuery] = useState('');
    const [topicFilters, setTopicFilters] = useState({ topics: [], subtopics: [] });
    const [categoryFilter, setCategoryFilter] = useState('');
    const [deadlineFilter, setDeadlineFilter] = useState('');
    const [positionFilters, setPositionFilters] = useState([]);

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
            <SearchBar onSearch={setSearchQuery} />
            <div className="grid grid-cols-[300px_1fr_300px] gap-8 py-8">
                <FilterLeft 
                    onCategoryChange={handleCategoryFilterChange}
                    onDeadlineChange={handleDeadlineFilterChange}
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
                />
            </div>
        </>
    );
}

export default MainContent;