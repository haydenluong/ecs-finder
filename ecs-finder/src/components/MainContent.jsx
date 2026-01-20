import { useState } from 'react';
import FilterLeft from './FilterLeft';
import FilterRight from './FilterRight';
import ActivityCards from './ActivityCards';
import SearchBar from './SearchBar';

function MainContent() {
    const [searchQuery, setSearchQuery] = useState('');
    const [topicFilters, setTopicFilters] = useState({ topics: [], subtopics: [] });

    const handleFilterChange = (filters) => {
    
        setTopicFilters(filters);
    };

    
    return (
        <>
            <SearchBar onSearch={setSearchQuery} />
            <div className="grid grid-cols-[300px_1fr_300px] gap-8 py-8">
                <FilterLeft />
                <div>
                    <ActivityCards 
                        searchQuery={searchQuery} 
                        topicFilters={topicFilters}
                    />
                </div>
                <FilterRight onFilterChange={handleFilterChange} />
            </div>
        </>
    );
}

export default MainContent;