import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { topicSet } from '../data/tagData';

const categories = ['Dự án & CLB', 'Cuộc thi (Tổ chức cuộc thi)', 'Cuộc thi (Tham gia cuộc thi)', 'Sự kiện (Workshop, Talkshows, ...)'];
const deadlineOptions = [
    { label: 'Trong 3 ngày', value: '3' },
    { label: 'Dưới 1 tuần', value: '7' },
    { label: 'Dưới 2 tuần', value: '14' },
    { label: 'Dưới 1 tháng', value: '30' },
    { label: 'Trên 1 tháng', value: '31' },
];
const viTriTuyen = ['Ban Nhân Sự', 'Ban Truyền Thông', 'Ban Dịch Thuật', 'Ban Nội Dung', 'Ban Chuyên Môn', 'Ban Thiết Kế', 'Ban Tài chính Đối ngoại', 'CTV Truyền Thông', 'Tình nguyện viên', 'Khác'];

// same gradient styles used in FilterLeft and FilterRight on desktop
const blueGradient = {
    background: 'linear-gradient(45deg, #3a7bd5 0%, #3d6ff0 25%, #5a7fff 50%, #7b6fef 75%, #9b4dca 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
};
const pinkGradient = {
    background: 'linear-gradient(45deg, #fc8ec5 0%, #ff8dd3 25%, #ffa1d8 50%, #ffc1d2 75%, #ffe0c3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
};
const headerGradient = {
    background: 'linear-gradient(90deg, #2f80ed 0%, #56ccf2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
};


function MobileFilterOverlay({
    onClose,
    categoryFilter, onCategoryChange,
    deadlineFilter, onDeadlineChange,
    topicFilters, onTopicFilterChange,
    positionFilters, onPositionFilterChange,
}) {
    const [expandedCategories, setExpandedCategories] = useState({});

    // stop page from scrolling behind the overlay
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const toggleExpand = (name) => {
        setExpandedCategories(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const handleTopicChange = (topicName, isChecked) => {
        let newTopics;
        let newSubtopics = topicFilters.subtopics;
        if (isChecked) {
            newTopics = [...topicFilters.topics, topicName];
            setExpandedCategories(prev => ({ ...prev, [topicName]: true }));
        } else {
            newTopics = topicFilters.topics.filter(t => t !== topicName);
            newSubtopics = topicFilters.subtopics.filter(s => s.parent !== topicName);
            setExpandedCategories(prev => ({ ...prev, [topicName]: false }));
        }
        onTopicFilterChange({ topics: newTopics, subtopics: newSubtopics });
    };

    const handleSubtopicChange = (parentTopic, subtopic, isChecked) => {
        let newSubtopics;
        let newTopics = [...topicFilters.topics];
        if (isChecked) {
            newSubtopics = [...topicFilters.subtopics, { parent: parentTopic, subtopic }];
            if (!topicFilters.topics.includes(parentTopic)) {
                newTopics = [...newTopics, parentTopic];
            }
        } else {
            newSubtopics = topicFilters.subtopics.filter(
                s => !(s.parent === parentTopic && s.subtopic === subtopic)
            );
        }
        onTopicFilterChange({ topics: newTopics, subtopics: newSubtopics });
    };

    const isSubtopicSelected = (parentTopic, subtopic) =>
        topicFilters.subtopics.some(s => s.parent === parentTopic && s.subtopic === subtopic);

    const handlePositionChange = (position, isChecked) => {
        const updated = isChecked
            ? [...positionFilters, position]
            : positionFilters.filter(p => p !== position);
        onPositionFilterChange(updated);
    };

    const clearAll = () => {
        onCategoryChange('');
        onDeadlineChange('');
        onTopicFilterChange({ topics: [], subtopics: [] });
        onPositionFilterChange([]);
    };

    const activeCount =
        (categoryFilter ? 1 : 0) +
        (deadlineFilter ? 1 : 0) +
        topicFilters.topics.length +
        topicFilters.subtopics.length +
        positionFilters.length;

    return (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(to bottom, #dbeafe, #f0f9ff)' }}>

            <div className="flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur-sm border-b border-blue-100 shadow-sm">
                <h2 className="text-lg font-bold" style={headerGradient}>Bộ lọc tìm kiếm</h2>
                <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors" onClick={onClose}>
                    <X className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-4">

                <div className="bg-blue-50 border-l-4 border-blue-400 rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold text-xl mb-4" style={blueGradient}>Thể loại</h3>
                    {categories.map((cat) => (
                        <label key={cat} className={`flex items-center gap-3 mb-2 cursor-pointer rounded-lg px-2 py-1 transition-colors ${categoryFilter === cat ? 'bg-blue-100' : 'hover:bg-blue-50'}`}>
                            <input type="radio" name="mobile-category" className="w-4 h-4 accent-blue-500"
                                checked={categoryFilter === cat} onChange={() => onCategoryChange(cat)} />
                            <span className={categoryFilter === cat ? 'text-blue-700 font-semibold' : 'text-gray-700'}>{cat}</span>
                        </label>
                    ))}
                    {categoryFilter && (
                        <button className="text-sm text-blue-500 mt-1 hover:underline" onClick={() => onCategoryChange('')}>Xóa lọc</button>
                    )}
                </div>

                <div className="bg-sky-50 border-l-4 border-sky-400 rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold text-xl mb-4 text-sky-600">Thời hạn đăng ký</h3>
                    {deadlineOptions.map((opt) => (
                        <label key={opt.value} className={`flex items-center gap-3 mb-2 cursor-pointer rounded-lg px-2 py-1 transition-colors ${deadlineFilter === opt.value ? 'bg-sky-100' : 'hover:bg-sky-50'}`}>
                            <input type="radio" name="mobile-deadline" className="w-4 h-4 accent-sky-500"
                                checked={deadlineFilter === opt.value} onChange={() => onDeadlineChange(opt.value)} />
                            <span className={deadlineFilter === opt.value ? 'text-sky-700 font-semibold' : 'text-gray-700'}>{opt.label}</span>
                        </label>
                    ))}
                    {deadlineFilter && (
                        <button className="text-sm text-sky-500 mt-1 hover:underline" onClick={() => onDeadlineChange('')}>Xóa lọc</button>
                    )}
                </div>

                <div className="bg-pink-50 border-l-4 border-pink-400 rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold text-xl mb-4" style={pinkGradient}>Chủ đề</h3>
                    {topicSet.map((cat) => (
                        <div key={cat.name} className="mb-2">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" className="w-4 h-4 accent-blue-500"
                                    id={`mobile-cat-${cat.name}`}
                                    checked={topicFilters.topics.includes(cat.name)}
                                    onChange={(e) => handleTopicChange(cat.name, e.target.checked)} />
                                <label htmlFor={`mobile-cat-${cat.name}`} className="flex-1 font-semibold text-pink-600 cursor-pointer">
                                    {cat.name}
                                </label>
                                <span className="text-xs bg-pink-100 text-pink-500 font-semibold px-1.5 py-0.5 rounded-full">
                                    {cat.subtopics.length}
                                </span>
                                {cat.subtopics.length > 0 && (
                                    <button onClick={() => toggleExpand(cat.name)} className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-pink-500 transition-colors px-1 py-0.5 rounded hover:bg-pink-50">
                                        {expandedCategories[cat.name]
                                            ? <><ChevronDown className="h-3.5 w-3.5" /><span>thu gọn</span></>
                                            : <><ChevronRight className="h-3.5 w-3.5" /><span>chi tiết</span></>}
                                    </button>
                                )}
                            </div>
                            {expandedCategories[cat.name] && (
                                <div className="ml-6 mt-2 space-y-2">
                                    {cat.subtopics.map((sub) => (
                                        <label key={sub} className="flex items-center gap-2 cursor-pointer hover:bg-pink-100 p-1 rounded">
                                            <input type="checkbox" className="w-4 h-4 accent-blue-500"
                                                checked={isSubtopicSelected(cat.name, sub)}
                                                onChange={(e) => handleSubtopicChange(cat.name, sub, e.target.checked)} />
                                            <span className="text-sm text-green-600">{sub}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="bg-sky-50 border-l-4 border-sky-400 rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold text-xl mb-4 text-sky-600">Vị trí tuyển</h3>
                    {viTriTuyen.map((viTri) => (
                        <label key={viTri} className={`flex items-center gap-3 mb-2 cursor-pointer rounded-lg px-2 py-1 transition-colors ${positionFilters.includes(viTri) ? 'bg-sky-100' : 'hover:bg-sky-50'}`}>
                            <input type="checkbox" className="w-4 h-4 accent-sky-500"
                                checked={positionFilters.includes(viTri)}
                                onChange={(e) => handlePositionChange(viTri, e.target.checked)} />
                            <span className={positionFilters.includes(viTri) ? 'text-sky-700 font-semibold' : 'text-gray-700'}>{viTri}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 flex items-center gap-3 px-5 py-4 bg-white/80 backdrop-blur-sm border-t border-blue-100 shadow-lg">
                <button
                    className="text-sm font-semibold text-gray-400 hover:text-red-400 transition-colors px-2"
                    onClick={clearAll}
                >
                    Xóa tất cả
                </button>
                <button
                    className="flex-1 py-2.5 rounded-full text-white font-semibold transition-all hover:brightness-105 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(90deg, #2f80ed 0%, #56ccf2 100%)' }}
                    onClick={onClose}
                >
                    Áp dụng
                    {activeCount > 0 && (
                        <span className="bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-full">{activeCount}</span>
                    )}
                </button>
            </div>
        </div>
    );
}

export default MobileFilterOverlay;
