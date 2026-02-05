import { useState, useEffect } from 'react';
import { mockActivities } from '../data/mockActivities';

const categoryTags = [];
const topicTags = [];
const subtopicTags = [];

mockActivities.forEach(activity => {
  activity.tags.forEach(tag => {
    if (tag.type === 'category' && !categoryTags.find(t => t.label === tag.label)) {
      categoryTags.push({ label:tag.label, type: 'category'})
    }
    if (tag.type === 'topic' && !topicTags.find(t => t.label === tag.label)) {
      topicTags.push({ label:tag.label, type: 'topic'})
    }
    if (tag.subtopic && !subtopicTags.find(t => t.label === tag.subtopic && t.parent === tag.label)) {
      subtopicTags.push({ label:tag.subtopic, type: 'subtopic', parent: tag.label})
    }
  });
});

function getTagColor(type) {
  const colors = {
    category: 'bg-blue-100 text-blue-600',
    topic: 'bg-pink-100 text-pink-600',
    subtopic: 'bg-green-100 text-green-600'
  };
  return colors[type] || 'bg-gray-100 text-gray-600';
}

function HeroSection() {

  const [displayedTags, setDisplayedTags] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  function randomizeTags() {
    setIsAnimating(true);
    const allTags = [...categoryTags, ...topicTags, ...subtopicTags];
    const shuffled = [...allTags].sort(() => 0.5 - Math.random());
    setDisplayedTags(shuffled.slice(0, 6));
    setTimeout(() => setIsAnimating(false), 1000);
  }

  useEffect(() => {
    randomizeTags();
  }, []);
    return (
        <>
            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 1s ease-out;
                }
            `}</style>
            
            <section className="relative w-full">
      <div className="relative h-44 sm:h-52 md:h-60 lg:h-72 overflow-hidden bg-gradient-to-br from-hero-navy via-hero-blue to-hero-blue-dark">
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="max-w-4xl text-xl font-bold leading-tight tracking-tight text-black sm:text-2xl md:text-3xl lg:text-4xl animate-fade-in whitespace-nowrap">
            Khám phá ngay tại đây những hoạt động ngoại khóa hot nhất!!
          </h1>

      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {displayedTags.map((tag) => (
          <span
            key={tag.label + tag.type + (tag.parent || '')}
            className={`px-5 py-2 rounded-full text-lg font-semibold animate-fade-in ${getTagColor(tag.type)}`}
            style={{ opacity: isAnimating ? 0.5 : 1, transition: 'opacity 1s' }}
          >
            {tag.label}
            {tag.type === 'subtopic' && tag.parent ? ` (${tag.parent})` : ''}
          </span>
        ))}
    </div>

      <button
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:pointer cursor-pointer disabled:opacity-50 rounded-full text-lg font-semibold font-medium transition"
        onClick={randomizeTags}
        disabled={isAnimating}
      >
          Ngẫu nhiên thử xem! 
      </button>
        </div>
      </div>
    </section>
        </>
    );
};

export default HeroSection;

// logic of how the HeroSection component works:
// 1. create arrays of topics ,... and add each tags.label available to each corresponding array
// 2. the randomizer takes all arrays into one, and shuffle the array
// 3. the first randomized tags will be in the displayedTags which would then be mapped and displayed