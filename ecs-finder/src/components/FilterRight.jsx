import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { topicSet } from '../data/tagData';

function FilterRight({ onTopicFilterChange, onPositionFilterChange, topicFilters }) {  
    const [expandedCategories, setExpandedCategories] = useState({});
    const [selectedTopics, setSelectedTopics] = useState([]);  
    const [selectedSubtopics, setSelectedSubtopics] = useState([]);  
    const [selectedPositions, setSelectedPositions] = useState([]);

    useEffect(() => {
        if (topicFilters) {
            setSelectedTopics(topicFilters.topics || []);
            setSelectedSubtopics(topicFilters.subtopics || []);
        }
    }, [topicFilters]);

    const categories = topicSet;
    
    const viTriTuyen = ['Ban Nhân Sự', 'Ban Truyền Thông', 'Ban Dịch Thuật', 'Ban Nội Dung', 'Ban Chuyên Môn', 'Ban Thiết Kế', 'Ban Tài chính Đối ngoại', 'CTV Truyền Thông', 'Tình nguyện viên', 'Khác'];
    
    const toggleCategory = (categoryName) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryName]: !prev[categoryName]
        }));
    };

    const handleTopicChange = (topicName, isChecked) => {
        let newSelectedTopics;
        let newSelectedSubtopics = selectedSubtopics;
        
        if (isChecked) {
            newSelectedTopics = [...selectedTopics, topicName];
        } else {
            newSelectedTopics = selectedTopics.filter(t => t !== topicName);
            newSelectedSubtopics = selectedSubtopics.filter(
                item => item.parent !== topicName
            );
            setSelectedSubtopics(newSelectedSubtopics);
        }
        
        setSelectedTopics(newSelectedTopics);
        onTopicFilterChange?.({ topics: newSelectedTopics, subtopics: newSelectedSubtopics });
    };

    const handleSubtopicChange = (parentTopic, subtopic, isChecked) => {
        let newSelectedSubtopics;
        let newSelectedTopics = [...selectedTopics];

        if (isChecked) {
            newSelectedSubtopics = [...selectedSubtopics, { parent: parentTopic, subtopic: subtopic }];
            if (!selectedTopics.includes(parentTopic)) {
                newSelectedTopics = [...selectedTopics, parentTopic];
                setSelectedTopics(newSelectedTopics);
            }
        } else {
            newSelectedSubtopics = selectedSubtopics.filter(
                item => !(item.parent === parentTopic && item.subtopic === subtopic)
            );
        }
        
        setSelectedSubtopics(newSelectedSubtopics);
        onTopicFilterChange?.({ topics: newSelectedTopics, subtopics: newSelectedSubtopics });
    };

    
    const isSubtopicSelected = (parentTopic, subtopic) => {
        return selectedSubtopics.some(
            item => item.parent === parentTopic && item.subtopic === subtopic
        );
    };

 
    const handlePositionChange = (position, isChecked) => {
        let newSelectedPositions;
        if (isChecked) {
            newSelectedPositions = [...selectedPositions, position];
        } else { 
            newSelectedPositions = selectedPositions.filter(p => p !== position);
        }
        setSelectedPositions(newSelectedPositions);
        onPositionFilterChange?.(newSelectedPositions);
    };

    return ( 
        <div>
            <div className="bg-pink-50 border-l-4 border-pink-500 rounded-lg max-w-xs p-6 mt-6 mr-4 shadow-md">
                <h3 className="font-bold mb-4 text-xl" style={{
                background: 'linear-gradient(45deg, #fc8ec5 0.000%, #ff8dd3 25.000%, #ffa1d8 50.000%, #ffc1d2 75.000%, #ffe0c3 100.000%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
                }}>Chủ đề</h3>
                
                {categories.map((category) => (
                    <div key={category.name} className="mb-2">
                        <div className="flex items-center gap-2">
                            {/* main category checkbox */}
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 accent-blue-500"
                                id={`cat-${category.name}`}
                                checked={selectedTopics.includes(category.name)}
                                onChange={(e) => handleTopicChange(category.name, e.target.checked)}
                            />
                            
                            <label 
                                htmlFor={`cat-${category.name}`}
                                className="flex-1 cursor-pointer font-semibold text-pink-600"
                            >
                                {category.name}
                            </label>
                            
                            {/* expand/collapse button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCategory(category.name);
                                }}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                {expandedCategories[category.name] ? (
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-500" />
                                )}
                            </button>
                        </div>
                        
                        {/* subcategories dropdown */}
                        {expandedCategories[category.name] && (
                            <div className="ml-6 mt-2 space-y-2">
                                {category.subtopics.map((sub) => (
                                    <label key={sub} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 accent-blue-500"
                                            checked={isSubtopicSelected(category.name, sub)}
                                            onChange={(e) => handleSubtopicChange(category.name, sub, e.target.checked)}
                                        />
                                        <span className="text-sm text-green-600">{sub}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-lg max-w-xs p-6 mt-6 shadow-md mr-4">
                <h3 className="font-bold mb-4 text-xl">Vị trí tuyển: </h3>
                {viTriTuyen.map((viTri) => (
                    <label key={viTri} className="flex mb-2 gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-blue-500"
                        checked={selectedPositions.includes(viTri)}
                        onChange={(e) => handlePositionChange(viTri, e.target.checked)}
                        />
                        <span>{viTri}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

export default FilterRight;