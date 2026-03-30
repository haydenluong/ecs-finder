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

            setExpandedCategories(prev => ({ ...prev, [topicName]: true }));
        } else {
            newSelectedTopics = selectedTopics.filter(t => t !== topicName);
            newSelectedSubtopics = selectedSubtopics.filter(
                item => item.parent !== topicName
            );
            setSelectedSubtopics(newSelectedSubtopics);
            setExpandedCategories(prev => ({ ...prev, [topicName]: false }));
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
            <div className="bg-pink-50 border-l-4 border-pink-500 rounded-lg max-w-xs p-6 mt-6 shadow-md">
                <h3 className="font-bold mb-4 text-xl" style={{
                background: 'linear-gradient(45deg, #fc8ec5 0.000%, #ff8dd3 25.000%, #ffa1d8 50.000%, #ffc1d2 75.000%, #ffe0c3 100.000%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
                }}>Chủ đề</h3>
                
                {categories.map((category) => (
                    <div key={category.name} className="mb-2">
                        <div className="flex items-center gap-2">
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

                            <span className="hidden xl:inline-flex text-xs bg-pink-100 text-pink-500 font-semibold px-1.5 py-0.5 rounded-full">
                                {category.subtopics.length}
                            </span>
                            
                            {category.subtopics.length > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCategory(category.name);
                                    }}
                                    className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-pink-500 transition-colors px-1 py-0.5 rounded hover:bg-pink-50"
                                >
                                    {expandedCategories[category.name]
                                        ? <ChevronDown className="h-3.5 w-3.5" />
                                        : <ChevronRight className="h-3.5 w-3.5" />}
                                </button>
                            )}
                        </div>
                        
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

            <div className="bg-sky-50 border-l-4 border-sky-400 rounded-lg max-w-xs p-6 mt-6 shadow-md">
                <h3 className="font-bold mb-4 text-xl text-sky-600">Vị trí tuyển (Nếu có)</h3>
                {viTriTuyen.map((viTri) => (
                    <label key={viTri} className={`flex mb-1 gap-2 cursor-pointer rounded-lg px-2 py-1 transition-colors ${selectedPositions.includes(viTri) ? 'bg-sky-100' : 'hover:bg-sky-50'}`}>
                        <input type="checkbox" className="w-4 h-4 accent-sky-500"
                        checked={selectedPositions.includes(viTri)}
                        onChange={(e) => handlePositionChange(viTri, e.target.checked)}
                        />
                        <span className={selectedPositions.includes(viTri) ? 'text-sky-700 font-semibold' : ''}>{viTri}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

export default FilterRight;