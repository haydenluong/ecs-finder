import { useState } from 'react'
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import MainContent from './components/MainContent';

function App() {
  const [topicFilters, setTopicFilters] = useState({ topics: [], subtopics: [] });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deadlineFilter, setDeadlineFilter] = useState('');
  const [positionFilters, setPositionFilters] = useState([]);

  function handleTagClick(tag) {
    if (tag.type === 'category') {
      setCategoryFilter(prev => prev === tag.label ? '' : tag.label);
    } else if (tag.type === 'topic') {
      setTopicFilters(prev => ({
        ...prev,
        topics: prev.topics.includes(tag.label)
          ? prev.topics.filter(t => t !== tag.label)
          : [...prev.topics, tag.label]
      }));
    } else if (tag.type === 'subtopic') {
      setTopicFilters(prev => {
        const alreadySelected = prev.subtopics.some(
          item => item.parent === tag.parent && item.subtopic === tag.label
        );
        if (alreadySelected) {
          const remainingSubtopics = prev.subtopics.filter(
            item => !(item.parent === tag.parent && item.subtopic === tag.label)
          );
          // remove parent topic too if no other subtopics under it remain selected
          const parentStillNeeded = remainingSubtopics.some(item => item.parent === tag.parent);
          return {
            topics: parentStillNeeded
              ? prev.topics
              : prev.topics.filter(t => t !== tag.parent),
            subtopics: remainingSubtopics
          };
        }
        return {
          topics: prev.topics.includes(tag.parent)
            ? prev.topics
            : [...prev.topics, tag.parent],
          subtopics: [...prev.subtopics, { parent: tag.parent, subtopic: tag.label }]
        };
      });
    }
  }

  return (
    <div>
    <Navbar/>
      <div className="bg-gradient-to-t from-[#1c92d2] to-[#f2fcfe] min-h-screen">
        <HeroSection onTagClick={handleTagClick} categoryFilter={categoryFilter} topicFilters={topicFilters}/>
        <MainContent
          topicFilters={topicFilters}
          setTopicFilters={setTopicFilters}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          deadlineFilter={deadlineFilter}
          setDeadlineFilter={setDeadlineFilter}
          positionFilters={positionFilters}
          setPositionFilters={setPositionFilters}
        />
      </div>
    </div>
  )
}

export default App;
