'use client';

import { useState } from 'react'
import { mockActivities } from '@/data/Activities'
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MainContent from '@/components/MainContent';
import Footer from '@/components/Footer';
import type { Lang, DeadlineFilter, TopicFilter, Tag, SubtopicTag } from '@/types';

function HomeClient() {
  const [lang, setLang] = useState<Lang>('VI');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [topicFilters, setTopicFilters] = useState<TopicFilter>({ topics: [], subtopics: [] });
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>('');
  const [positionFilters, setPositionFilters] = useState<string[]>([]);

  function handleClearAll(): void {
    setCategoryFilter('');
    setDeadlineFilter('');
    setTopicFilters({ topics: [], subtopics: [] });
    setPositionFilters([]);
    setSearchQuery('');
  }

  function handleTagClick(tag: Tag): void {
    if (tag.type === 'category') {
      setCategoryFilter(prev => prev === tag.label ? '' : tag.label);
    } else if (tag.type === 'topic') {
      setTopicFilters({ topics: [tag.label], subtopics: [] });
      setCategoryFilter('');
      setDeadlineFilter('');
      setPositionFilters([]);
    } else if (tag.type === 'subtopic') {
      const subtopicTag = tag as SubtopicTag;
      setTopicFilters(prev => {
        const alreadySelected = prev.subtopics.some(
          item => item.parent === subtopicTag.parent && item.subtopic === subtopicTag.label
        );
        if (alreadySelected) {
          const remainingSubtopics = prev.subtopics.filter(
            item => !(item.parent === subtopicTag.parent && item.subtopic === subtopicTag.label)
          );
          const parentStillNeeded = remainingSubtopics.some(item => item.parent === subtopicTag.parent);
          return {
            topics: parentStillNeeded
              ? prev.topics
              : prev.topics.filter(t => t !== subtopicTag.parent),
            subtopics: remainingSubtopics
          };
        }
        return {
          topics: prev.topics.includes(subtopicTag.parent)
            ? prev.topics
            : [...prev.topics, subtopicTag.parent],
          subtopics: [...prev.subtopics, { parent: subtopicTag.parent, subtopic: subtopicTag.label }]
        };
      });
    }
  }

  return (
    <div id="top">
      <Navbar lang={lang} onLangChange={setLang} />
      <HeroSection
        activitiesCount={mockActivities.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        topicFilters={topicFilters}
        onTagClick={handleTagClick}
      />
      <MainContent
        searchQuery={searchQuery}
        topicFilters={topicFilters}
        setTopicFilters={setTopicFilters}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        deadlineFilter={deadlineFilter}
        setDeadlineFilter={setDeadlineFilter}
        positionFilters={positionFilters}
        setPositionFilters={setPositionFilters}
        onClearAll={handleClearAll}
      />
      <Footer />
    </div>
  )
}

export default HomeClient;
