import { useState, useEffect } from 'react';
import { MapPin, Clock } from "lucide-react";
import { mockActivities } from "../data/mockActivities";

function ActivityCards() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);

    const getTagColor = (type) => {
        const colors = {
            category: 'bg-blue-100 text-blue-600',
            topic: 'bg-pink-100 text-pink-600',
            position: 'bg-green-100 text-green-600'
        };
    return colors[type] || 'bg-gray-100 text-gray-600';
    }; 

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else { 
            document.body.style.overflow = 'unset'
        }
    }, [isModalOpen]);
    
    return (    
        <>
        {mockActivities.map((activity) => (
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
                        className="rounded-lg shadow-md w-32 h-32 object-cover"
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
                        
                        <div className="flex items-center gap-1 text-gray-600 text-sm mt-2">
                            📅 {activity.deadline}
                        </div>

                        <div className="ml-2 mt-2 text-sm text-gray-700 line-clamp-3">
                            {activity.description}
                        </div>

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

    {isModalOpen && selectedActivity && (
    <div 
        className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        onClick={() => setIsModalOpen(false)}
    >
        <div 
            className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
        >
            <button 
                className="float-right cursor-pointer text-gray-500 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setIsModalOpen(false)}
            >
                ×
            </button>
            
            <div className="flex gap-6 mt-8">
                {/* Image */}
                <div className="w-1/3">
                    <img 
                        src={selectedActivity.image} 
                        alt="" 
                        className="w-full rounded-lg"
                    />
                </div>
                
                {/* Information */}
                <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-4">{selectedActivity.name}</h2>
                    
                    <p className="text-gray-700 mb-4">
                        {selectedActivity.description}
                    </p>
                    
                    {/* Info w/ icons */}
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

                    {/* Related to positions */}
                    {selectedActivity.positions && selectedActivity.positions.length > 0 && (
                        <div className="mt-2">
                            <span className="font-semibold">Vị trí tuyển: </span>
                            <span className="text-gray-700">{selectedActivity.positions.join(", ")}</span>
                        </div>

                    )}

                    {/* Link */}
                    <div className="mt-4">
                        <a href="" className="flex items-center justify-center bg-blue-500 p-2 rounded-lg hover:bg-blue-700 transition-colors w-full">
                            <span className="text-xl mr-2 text-white">↗</span>
                            <span className="text-white text-sm">Xem chi tiết</span>
                        </a>
                    </div> 
                    
                    {/*Tags*/}
                    <div className="flex gap-2 mt-4">
                        {selectedActivity.tags.map((tag, index) => (
                            <span key = {index} className={`${getTagColor(tag.type)} px-3 py-1 rounded-full text-xs font-medium`}>
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