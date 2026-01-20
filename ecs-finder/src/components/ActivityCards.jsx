import { useState, useEffect } from 'react';
import { MapPin, Clock } from "lucide-react";
import { mockActivities } from "../data/mockActivities";

function ActivityCards({ searchQuery = '', topicFilters = { topics: [], subtopics: [] } }) {
    console.log('🎬 ActivityCards rendered with filters:', topicFilters);  // ADD THIS LINE
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);

    // helper function to assign colors based on tag type
    const getTagColor = (type) => {
        const colors = {
            category: 'bg-blue-100 text-blue-600',      // blue for categories like "cuộc thi", "dự án"
            topic: 'bg-pink-100 text-pink-600',         // pink for topics like "STEM", "xã hội"
            position: 'bg-green-100 text-green-600'     // green for positions
        };
        return colors[type] || 'bg-gray-100 text-gray-600'; // default gray if type not found
    };

    // filter activities based on search input and selected topic filters
// filter activities based on search input and selected topic filters
const searchedActivities = mockActivities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesTopic = true;
    
    if (topicFilters.topics.length > 0 || topicFilters.subtopics.length > 0) {
        console.log('🔍 Filtering activity:', activity.name);
        console.log('   Activity tags:', activity.tags);
        console.log('   Looking for topics:', topicFilters.topics);
        console.log('   Looking for subtopics:', topicFilters.subtopics);
        
        matchesTopic = activity.tags.some(tag => {
            if (tag.type !== 'topic') return false;
            
            console.log('   Checking tag:', tag);
            
            const mainTopicSelected = topicFilters.topics.includes(tag.label);
            console.log('   Main topic match?', mainTopicSelected);
            
            const subtopicSelected = topicFilters.subtopics.some(item => {
                const matches = item.parent === tag.label && item.subtopic === tag.subtopic;
                console.log('      Comparing:', item, 'with', tag, '→', matches);
                return matches;
            });
            console.log('   Subtopic match?', subtopicSelected);
            
            const hasSubtopicsForThisTopic = topicFilters.subtopics.some(
                item => item.parent === tag.label
            );
            
            if (mainTopicSelected && !hasSubtopicsForThisTopic) {
                console.log('   ✅ Matched main topic (no subtopics specified)');
                return true;
            }
            
            if (subtopicSelected) {
                console.log('   ✅ Matched subtopic');
            }
            return subtopicSelected;
        });
        
        console.log('   Result:', matchesTopic ? '✅ PASS' : '❌ FAIL');
    }

    return matchesSearch && matchesTopic;
});

console.log('🎯 Final filtered count:', searchedActivities.length);

    // prevent body scroll when modal is open
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';  // lock scrolling
        } else { 
            document.body.style.overflow = 'unset';   // allow scrolling again
        }
    }, [isModalOpen]);
    
    return (    
        <>
        {/* show message if no activities match the filters */}
        {searchedActivities.length === 0 && (
            <div className="text-xl font-bold text-center text-gray-500 py-8">
                Không tìm thấy kết quả nào phù hợp 
            </div>
        )}

        {/* map through filtered activities and display as cards */}
        {searchedActivities.map((activity) => (
            <div 
                key={activity.id}
                className="group bg-white rounded-lg shadow-md p-4 flex gap-4 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 mb-4 cursor-pointer" 
                onClick={() => {
                    setSelectedActivity(activity);  // store which activity was clicked
                    setIsModalOpen(true);            // open modal
                }}
            >
                {/* activity thumbnail image */}
                <img 
                    src={activity.image}
                    alt={activity.name}
                    className="rounded-lg shadow-md w-32 h-32 object-cover"
                />

                {/* activity info section */}
                <div className="flex-1 gap-4">
                    {/* activity title with hover gradient effect */}
                    <h3 className="font-bold cursor-pointer transition-all duration-300
                    group-hover:bg-gradient-to-t
                    group-hover:from-[#56CCF2]
                    group-hover:to-[#2F80ED]
                    group-hover:bg-clip-text
                    group-hover:text-transparent">
                        {activity.name}
                    </h3>

                    {/* location info */}
                    <div className="flex items-center gap-1 text-gray-600 text-sm mt-2">
                        <span>📍</span> 
                        <span>{activity.location}</span>
                    </div>
                    
                    {/* deadline info */}
                    <div className="flex items-center gap-1 text-gray-600 text-sm mt-2">
                        📅 {activity.deadline}
                    </div>

                    {/* short description preview, max 3 lines */}
                    <div className="ml-2 mt-2 text-sm text-gray-700 line-clamp-3">
                        {activity.description}
                    </div>

                    {/* tags with dynamic colors */}
                    <div className="flex gap-2 mt-2">
                        {activity.tags.map((tag, index) => (
                            <span 
                                key={index}
                                className={`${getTagColor(tag.type)} px-3 py-1 rounded-full text-xs font-medium`}
                            >
                                {tag.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        ))}

        {/* modal popup for detailed view */}
        {isModalOpen && selectedActivity && (
            <div 
                className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}  // dark overlay
                onClick={() => setIsModalOpen(false)}  // close modal when clicking outside
            >
                <div 
                    className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}  // prevent modal close when clicking inside
                >
                    {/* close button */}
                    <button 
                        className="float-right cursor-pointer text-gray-500 hover:text-gray-700 text-2xl font-bold"
                        onClick={() => setIsModalOpen(false)}
                    >
                        ×
                    </button>
                    
                    <div className="flex gap-6 mt-8">
                        {/* left side: larger image */}
                        <div className="w-1/3">
                            <img 
                                src={selectedActivity.image} 
                                alt={selectedActivity.name}
                                className="w-full rounded-lg"
                            />
                        </div>
                        
                        {/* right side: detailed info */}
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-4">{selectedActivity.name}</h2>
                            
                            {/* full description */}
                            <p className="text-gray-700 mb-4">
                                {selectedActivity.description}
                            </p>
                            
                            {/* location and deadline with icons */}
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

                            {/* show positions if available */}
                            {selectedActivity.positions && selectedActivity.positions.length > 0 && (
                                <div className="mt-4">
                                    <span className="font-semibold">Vị trí tuyển: </span>
                                    <span className="text-gray-700">{selectedActivity.positions.join(", ")}</span>
                                </div>
                            )}

                            {/* external link button */}
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
                            
                            {/* tags repeated in modal */}
                            <div className="flex gap-2 mt-4">
                                {selectedActivity.tags.map((tag, index) => (
                                    <span 
                                        key={index} 
                                        className={`${getTagColor(tag.type)} px-3 py-1 rounded-full text-xs font-medium`}
                                    >
                                        {tag.label}
                                    </span>
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