import { useState, useEffect } from 'react';
import { mockActivities } from '../data/mockActivities';
import { categorySet, topicSet } from '../data/tagData';

// category tags directly from categorySet
const categoryTags = categorySet;

// topic and subtopic tags from full tagData (not limited to mockActivities)
const topicTags = topicSet.map(cat => ({ label: cat.name, type: 'topic' }));
const subtopicTags = [];
topicSet.forEach(cat => {
  cat.subtopics.forEach(sub => {
    subtopicTags.push({ label: sub, type: 'subtopic', parent: cat.name });
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

function HeroSection({ onTagClick, categoryFilter = '', topicFilters = { topics: [], subtopics: [] } }) {

  const [displayedTags, setDisplayedTags] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  function randomizeTags() {
    setIsAnimating(true);
    const allTags = [...categoryTags, ...topicTags, ...subtopicTags];
    const shuffled = [...allTags].sort(() => 0.5 - Math.random());
    setDisplayedTags(shuffled.slice(0, 4));
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
      <div className="relative py-6 sm:py-0 sm:h-52 md:h-60 lg:h-72 overflow-hidden bg-gradient-to-br from-hero-navy via-hero-blue to-hero-blue-dark">
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="max-w-4xl text-base font-bold leading-tight tracking-tight text-black sm:text-2xl md:text-3xl lg:text-4xl animate-fade-in">
            Khám phá ngay tại đây những hoạt động ngoại khóa hot nhất!!
          </h1>

      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {displayedTags.map((tag) => (
          <span
            key={tag.label + tag.type + (tag.parent || '')}
            className={`px-3 py-1 md:px-5 md:py-2 rounded-full text-xs md:text-lg font-semibold animate-fade-in cursor-pointer hover:brightness-95 transition-all ${
              (tag.type === 'category' && categoryFilter === tag.label) ||
              (tag.type === 'topic' && topicFilters.topics.includes(tag.label)) ||
              (tag.type === 'subtopic' && topicFilters.subtopics.some(s => s.subtopic === tag.label && s.parent === tag.parent))
                ? 'ring-2 ring-offset-1 ring-blue-500 scale-105'
                : ''
            } ${getTagColor(tag.type)}`}
            style={{ opacity: isAnimating ? 0.5 : 1, transition: 'opacity 1s' }}
            onClick={() => onTagClick && onTagClick(tag)}
          >
            {tag.label}
            {tag.type === 'subtopic' && tag.parent ? ` (${tag.parent})` : ''}
          </span>
        ))}
    </div>

      <button
        className="mt-3 md:mt-6 px-4 py-1.5 md:py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 cursor-pointer disabled:opacity-50 text-sm md:text-lg font-semibold transition"
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