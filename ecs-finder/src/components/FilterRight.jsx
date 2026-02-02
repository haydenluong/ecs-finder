import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

function FilterRight({ onTopicFilterChange, onPositionFilterChange }) {  
    const [expandedCategories, setExpandedCategories] = useState({});
    const [selectedTopics, setSelectedTopics] = useState([]);  
    const [selectedSubtopics, setSelectedSubtopics] = useState([]);  
    const [selectedPositions, setSelectedPositions] = useState([]);

    const categories = [
        {
            name: 'STEM',
            subcategories: ['Khoa học tự nhiên', 'Công nghệ', 'Kỹ thuật / Robotics', 'Khác']
        },
        {
            name: 'Xã hội',
            subcategories: ['Thiện nguyện', 'Giáo dục', 'Bình đẳng xã hội', 'Môi trường', 'Văn hóa', 'Khác']
        },
        {
            name: 'Kinh tế',
            subcategories: ['Tài chính & Kinh doanh', 'Marketing', 'Khác']
        },
        {
            name: 'Nghệ thuật & Sáng tạo',
            subcategories: ['Hội họa', 'Viết & Biên tập', 'Thiết kế', 'Khác']
        },
        {
            name: 'Ngôn ngữ & Giao tiếp',
            subcategories: ['Tiếng Anh', 'Tranh biện & Hùng biện', 'Podcast', 'Khác']
        },
        {
            name: 'Sức khỏe',
            subcategories: ['Tâm lý học', 'Dinh dưỡng & Lối sống', 'Khác']
        }
    ];
    
    const viTriTuyen = ['Ban Nhân Sự', 'Ban Truyền Thông', 'Ban Dịch Thuật', 'Ban Nội Dung', 'Ban Chuyên Môn', 'Ban Thiết Kế', 'Ban Tài chính Đối ngoại', 'CTV Truyền Thông', 'Tình nguyện viên', 'Khác'];
    
    // toggle expand/collapse for categories
    const toggleCategory = (categoryName) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryName]: !prev[categoryName]
        }));
    };

    // handle main topic checkbox
    const handleTopicChange = (topicName, isChecked) => {
        let newSelectedTopics;
        let newSelectedSubtopics = selectedSubtopics;
        
        if (isChecked) {
            newSelectedTopics = [...selectedTopics, topicName];
        } else {
            newSelectedTopics = selectedTopics.filter(t => t !== topicName);
            // remove all subtopics of this parent topic
            newSelectedSubtopics = selectedSubtopics.filter(
                item => item.parent !== topicName
            );
            setSelectedSubtopics(newSelectedSubtopics);
        }
        
        setSelectedTopics(newSelectedTopics);
        onTopicFilterChange?.({ topics: newSelectedTopics, subtopics: newSelectedSubtopics });
    };

    // handle subtopic checkbox
    const handleSubtopicChange = (parentTopic, subtopic, isChecked) => {
        let newSelectedSubtopics;
        let newSelectedTopics = [...selectedTopics];

        if (isChecked) {
            // add subtopic with parent reference
            newSelectedSubtopics = [...selectedSubtopics, { parent: parentTopic, subtopic: subtopic }];
            // auto-select parent if not already selected
            if (!selectedTopics.includes(parentTopic)) {
                newSelectedTopics = [...selectedTopics, parentTopic];
                setSelectedTopics(newSelectedTopics);
            }
        } else {
            // remove this specific subtopic
            newSelectedSubtopics = selectedSubtopics.filter(
                item => !(item.parent === parentTopic && item.subtopic === subtopic)
            );
        }
        
        setSelectedSubtopics(newSelectedSubtopics);
        onTopicFilterChange?.({ topics: newSelectedTopics, subtopics: newSelectedSubtopics });
    };

    // check if a subtopic is selected (needs both parent and name check)
    const isSubtopicSelected = (parentTopic, subtopic) => {
        return selectedSubtopics.some(
            item => item.parent === parentTopic && item.subtopic === subtopic
        );
    };

    // position checkbox  
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
            <div className="bg-white rounded-lg max-w-xs p-6 mt-6 mr-4 shadow-md">
                <h3 className="font-bold mb-4 text-xl">Chủ đề</h3>
                
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
                                className="flex-1 cursor-pointer font-semibold text-gray-700"
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
                                {category.subcategories.map((sub) => (
                                    <label key={sub} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 accent-blue-500"
                                            checked={isSubtopicSelected(category.name, sub)}
                                            onChange={(e) => handleSubtopicChange(category.name, sub, e.target.checked)}
                                        />
                                        <span className="text-sm text-gray-600">{sub}</span>
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