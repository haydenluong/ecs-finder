'use client';

import { useState } from 'react'
import { mockActivities } from '@/data/Activities'
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MainContent from '@/components/MainContent';
import Footer from '@/components/Footer';
import type { Lang, DeadlineFilter, TopicFilter, Tag } from '@/types';

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
    if (tag.type !== 'topic') return;
    setTopicFilters(prev =>
      prev.topics.includes(tag.label)
        ? { topics: [], subtopics: [] }
        : { topics: [tag.label], subtopics: [] }
    );
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
