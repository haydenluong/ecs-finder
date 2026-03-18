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
        } else {
            // deselecting a parent also clears its subtopics
            newTopics = topicFilters.topics.filter(t => t !== topicName);
            newSubtopics = topicFilters.subtopics.filter(s => s.parent !== topicName);
        }
        onTopicFilterChange({ topics: newTopics, subtopics: newSubtopics });
    };

    const handleSubtopicChange = (parentTopic, subtopic, isChecked) => {
        let newSubtopics;
        let newTopics = [...topicFilters.topics];
        if (isChecked) {
            newSubtopics = [...topicFilters.subtopics, { parent: parentTopic, subtopic }];
            // auto-check the parent when a subtopic is picked
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

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-50">

            {/* header */}
            <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800">Bộ lọc tìm kiếm</h2>
                <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors" onClick={onClose}>
                    <X className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* filter sections — pb-28 so content doesn't hide under the footer */}
            <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-4">

                {/* Thể loại — blue card, matches FilterLeft on desktop */}
                <div className="bg-blue-50 border-l-4 border-blue-400 rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold text-xl mb-4" style={blueGradient}>Thể loại</h3>
                    {categories.map((cat) => (
                        <label key={cat} className="flex items-center gap-3 mb-3 cursor-pointer">
                            <input type="radio" name="mobile-category" className="w-4 h-4 accent-blue-500"
                                checked={categoryFilter === cat} onChange={() => onCategoryChange(cat)} />
                            <span className="text-gray-700">{cat}</span>
                        </label>
                    ))}
                    {categoryFilter && (
                        <button className="text-sm text-blue-500 mt-1" onClick={() => onCategoryChange('')}>Xóa lọc</button>
                    )}
                </div>

                {/* Thời hạn đăng ký — plain white card */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold text-xl mb-4 text-gray-800">Thời hạn đăng ký</h3>
                    {deadlineOptions.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-3 mb-3 cursor-pointer">
                            <input type="radio" name="mobile-deadline" className="w-4 h-4 accent-blue-500"
                                checked={deadlineFilter === opt.value} onChange={() => onDeadlineChange(opt.value)} />
                            <span className="text-gray-700">{opt.label}</span>
                        </label>
                    ))}
                    {deadlineFilter && (
                        <button className="text-sm text-blue-500 mt-1" onClick={() => onDeadlineChange('')}>Xóa lọc</button>
                    )}
                </div>

                {/* Chủ đề — pink card, matches FilterRight on desktop */}
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
                                <button onClick={() => toggleExpand(cat.name)} className="p-1 hover:bg-pink-100 rounded">
                                    {expandedCategories[cat.name]
                                        ? <ChevronDown className="h-4 w-4 text-gray-500" />
                                        : <ChevronRight className="h-4 w-4 text-gray-500" />}
                                </button>
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

                {/* Vị trí tuyển — plain white card */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold text-xl mb-4 text-gray-800">Vị trí tuyển</h3>
                    {viTriTuyen.map((viTri) => (
                        <label key={viTri} className="flex items-center gap-3 mb-3 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 accent-blue-500"
                                checked={positionFilters.includes(viTri)}
                                onChange={(e) => handlePositionChange(viTri, e.target.checked)} />
                            <span className="text-gray-700">{viTri}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* footer — fixed so it's always reachable no matter how far you scroll */}
            <div className="fixed bottom-0 left-0 right-0 flex gap-3 px-5 py-4 bg-white border-t border-gray-200 shadow-lg">
                <button
                    className="flex-1 py-2.5 rounded-full border border-gray-300 font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    onClick={clearAll}
                >
                    Xóa tất cả
                </button>
                <button
                    className="flex-1 py-2.5 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
                    onClick={onClose}
                >
                    Áp dụng
                </button>
            </div>
        </div>
    );
}

export default MobileFilterOverlay;
