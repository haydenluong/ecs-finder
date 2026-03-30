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
      <div
        className="relative min-h-[200px] py-10 md:py-14 overflow-hidden"
        style={{ backgroundImage: 'linear-gradient(to bottom, #c2e9fb 0%, transparent 100%)' }}
      >
        {/* decorative blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute -bottom-12 -right-12 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center gap-4 px-4 text-center md:gap-6">
          <h1 className="animate-fade-in max-w-4xl text-lg font-bold leading-snug tracking-tight text-blue-900 drop-shadow-sm sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl">
            Hong biết bắt đầu từ đâu thì hãy thử click vào{' '}
            <span className="text-blue-700 underline decoration-wavy decoration-blue-400/60">
              những bộ lọc ngẫu nhiên này
            </span>{' '}
            xemm!
          </h1>

      <div className="flex flex-wrap justify-center gap-2">
        {displayedTags.map((tag) => (
          <span
            key={tag.label + tag.type + (tag.parent || '')}
            className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full text-sm md:text-base font-semibold shadow-md animate-fade-in cursor-pointer hover:shadow-lg hover:scale-105 transition-all ${
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
        className="rounded-full border-2 border-blue-600 px-6 py-2.5 text-base font-semibold text-blue-700 transition-all hover:bg-blue-600 hover:text-white disabled:opacity-50 md:py-2.5 md:text-base cursor-pointer"
        onClick={randomizeTags}
        disabled={isAnimating}
      >
        🎲 Ngẫu nhiên thử xem!
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