import { useState, useEffect } from 'react';
import { MapPin, Clock } from "lucide-react";
import { mockActivities } from "../data/mockActivities";

function ActivityCards({ searchQuery = '', topicFilters = { topics: [], subtopics: [] }, categoryFilter = '', deadlineFilter = '', positionFilters = []}) {
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const CARDS_PER_PAGE = 6;

    const getTagColor = (type) => {
        const colors = {
            category: 'bg-blue-100 text-blue-600',
            topic: 'bg-pink-100 text-pink-600',
            subtopic: 'bg-green-100 text-green-600'
        };
        return colors[type] || 'bg-gray-100 text-gray-600';
    };

const searchedActivities = mockActivities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !categoryFilter || 
        activity.tags.some(tag => 
            tag.type === 'category' && tag.label === categoryFilter
        );

    const matchesPosition = positionFilters.length === 0 || 
    activity.positions.some(pos => positionFilters.includes(pos));

    let matchesDeadline = true; 
    if (deadlineFilter) {
        const today = new Date();
        const deadlineParts = activity.deadline.split('/');
        const activityDeadline = new Date(deadlineParts[2], deadlineParts[1]-1, deadlineParts[0]);
        const daysDiff = Math.ceil((activityDeadline - today) / (1000 * 60 * 60 * 24));

        if (deadlineFilter === '3') {
            matchesDeadline = daysDiff <= 3 && daysDiff >= 0;
        } else if (deadlineFilter === '7') {
            matchesDeadline = daysDiff <= 7 && daysDiff >= 0;
        } else if (deadlineFilter === '14') {
            matchesDeadline = daysDiff <= 14 && daysDiff >= 0;
        } else if (deadlineFilter === '30') {
            matchesDeadline = daysDiff <= 30 && daysDiff >= 0;
        } else if (deadlineFilter === '31') {
            matchesDeadline = daysDiff > 30;
        }
    };

    let matchesTopic = true;
    
    if (topicFilters.topics.length > 0 || topicFilters.subtopics.length > 0) {
        
        matchesTopic = activity.tags.some(tag => {
            if (tag.type !== 'topic') return false;
            
            const mainTopicSelected = topicFilters.topics.includes(tag.label);
            
            const subtopicSelected = topicFilters.subtopics.some(item => {
                return item.parent === tag.label && item.subtopic === tag.subtopic;
            });
            
            const hasSubtopicsForThisTopic = topicFilters.subtopics.some(
                item => item.parent === tag.label
            );

            if (mainTopicSelected && !hasSubtopicsForThisTopic) {
                return true;
            }
            
            return subtopicSelected;
        });
        
    }

    return matchesSearch && matchesTopic && matchesCategory && matchesPosition && matchesDeadline;
});

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, categoryFilter, deadlineFilter, deadlineFilter, positionFilters, topicFilters]);

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else { 
            document.body.style.overflow = 'unset';  
        }
    }, [isModalOpen]);
    
    const totalPages = Math.ceil(searchedActivities.length / CARDS_PER_PAGE);
    const pagedActivities = searchedActivities.slice((currentPage - 1) * CARDS_PER_PAGE, currentPage * CARDS_PER_PAGE);

    return (    
        <>
        {searchedActivities.length === 0 && (
            <div className="text-xl font-bold text-center text-gray-500 py-8">
                Không tìm thấy kết quả nào phù hợp 
            </div>
        )}

        {searchedActivities.length > 0 && (
            <p className="text-2sm font-bold text-gray-600 mb-4"> 
                Tìm thấy {searchedActivities.length} hoạt động phù hợp
            </p>
        )}

        {pagedActivities.map((activity) => (
            <div 
                key={activity.id}
                className="group bg-white rounded-lg shadow-md p-4 flex gap-4 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 mb-4 cursor-pointer" 
                onClick={() => {
                    setSelectedActivity(activity); 
                    setIsModalOpen(true);           
                }}
            >

                <img 
                    src={activity.image}
                    alt={activity.name}
                    referrerPolicy="no-referrer"
                    className="rounded-lg shadow-md w-20 h-20 md:w-32 md:h-32 object-cover flex-shrink-0"
                />

                <div className="flex-1 gap-4">
                    <h3 className="font-bold cursor-pointer transition-all duration-300
                    group-hover:bg-gradient-to-t
                    group-hover:from-[#56CCF2]
                    group-hover:to-[#2F80ED]
                    group-hover:bg-clip-text
                    group-hover:text-transparent">
                        {activity.name}
                    </h3>

                    <div className="flex items-center gap-1 text-gray-600 text-sm mt-2">
                        <span>📍</span> 
                        <span>{activity.location}</span>
                    </div>
         
                    <div className="flex items-center gap-1 text-gray-600 text-sm mt-1 md:mt-2">
                        📅 {activity.deadline}
                    </div>

                    <div className="ml-2 mt-2 text-sm text-gray-700 line-clamp-3">
                        {activity.description}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                        {activity.tags.map((tag, index) => (
                            <>
                                <span 
                                    key={`${index}-main`}
                                    className={`${getTagColor(tag.type)} px-3 py-1 rounded-lg text-xs font-medium`}
                                >
                                    {tag.label}
                                </span>
                                {tag.subtopic && (
                                    <span 
                                        key={`${index}-sub`}
                                        className={`${getTagColor('subtopic')} px-3 py-1 rounded-lg text-xs font-medium`}
                                    >
                                        {tag.subtopic}
                                    </span>
                                )}
                            </>
                        ))}
                    </div>
                </div>
            </div>
        ))}
        {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 mb-2">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                    ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                            page === currentPage
                                ? 'bg-blue-500 text-white shadow-sm'
                                : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                    →
                </button>
            </div>
        )}
        {isModalOpen && selectedActivity && (
            <div 
                className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                onClick={() => setIsModalOpen(false)}
            >
                <div 
                    className="bg-white rounded-lg p-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        className="float-right cursor-pointer text-gray-500 hover:text-gray-700 text-2xl font-bold"
                        onClick={() => setIsModalOpen(false)}
                    >
                        ×
                    </button>
                    
                    <div className="flex flex-col md:flex-row gap-6 mt-8">
                        <div className="w-full md:w-72 md:self-start flex-shrink-0">
                            <img 
                                src={selectedActivity.image} 
                                alt={selectedActivity.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-56 object-cover rounded-lg"
                            />
                        </div>
                        
                      
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-4">{selectedActivity.name}</h2>
                            
                          
                            <p className="text-gray-700 mb-4">
                                {selectedActivity.description}
                            </p>
                            
                       
                            <div className="mt-1.5 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1 bg-gray-100 p-2 rounded-lg">
                                    <MapPin className="h-3.5 w-3.5 text-blue-500 mr-1" />
                                    <span>Địa điểm: </span>
                                    <span className="font-semibold">{selectedActivity.location}</span>
                                </div>
                                <div className="flex items-center gap-1 p-2 bg-gray-100 rounded-lg">
                                    <Clock className="h-3.5 w-3.5 text-blue-500 mr-1" />
                                    <span>Hạn đăng ký: </span>
                                    <span className="font-semibold">{selectedActivity.deadline}</span>
                                </div>
                            </div>

                          
                            {selectedActivity.positions && selectedActivity.positions.length > 0 && (
                                <div className="mt-4">
                                    <span className="font-semibold">Vị trí tuyển: </span>
                                    <span className="text-gray-700">{selectedActivity.positions.join(", ")}</span>
                                </div>
                            )}

                          
                            <div className="mt-4">
                                <a 
                                    href={selectedActivity.link || "#"} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center bg-blue-500 p-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
                                >
                                    <span className="text-xl mr-2 text-white">↗</span>
                                    <span className="text-white text-sm">Xem chi tiết</span>
                                </a>
                            </div> 
                            
                           
                            <div className="flex flex-wrap gap-2 mt-4">
                                {selectedActivity.tags.map((tag, index) => (
                                    <>
                                        <span 
                                            key={`${index}-main`}
                                            className={`${getTagColor(tag.type)} px-3 py-1 rounded-lg text-xs font-medium`}
                                        >
                                            {tag.label}
                                        </span>
                                        {tag.subtopic && (
                                            <span 
                                                key={`${index}-sub`}
                                                className={`${getTagColor('subtopic')} px-3 py-1 rounded-lg text-xs font-medium`}
                                            >
                                                {tag.subtopic}
                                            </span>
                                        )}
                                    </>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

export default ActivityCards;