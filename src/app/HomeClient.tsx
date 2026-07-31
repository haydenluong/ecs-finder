'use client';

import { useReducer, useState } from 'react'
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MainContent from '@/components/MainContent';
import Footer from '@/components/Footer';
import type { Activity, Lang, DeadlineFilter, TopicFilter, Tag } from '@/types';

interface HomeClientProps {
  activities: Activity[];
}

// The five filter slices always change together — every one of them is wiped by
// "Xoá tất cả" — so they live in one reducer instead of five useState calls.
interface FilterState {
  searchQuery: string;
  topicFilters: TopicFilter;
  categoryFilter: string;
  deadlineFilter: DeadlineFilter;
  positionFilters: string[];
}

type FilterAction =
  | { type: 'setSearch'; value: string }
  | { type: 'setTopics'; value: TopicFilter }
  | { type: 'setCategory'; value: string }
  | { type: 'setDeadline'; value: DeadlineFilter }
  | { type: 'setPositions'; value: string[] }
  | { type: 'clearAll' };

const initialFilterState: FilterState = {
  searchQuery: '',
  topicFilters: { topics: [], subtopics: [] },
  categoryFilter: '',
  deadlineFilter: '',
  positionFilters: [],
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'setSearch': return { ...state, searchQuery: action.value };
    case 'setTopics': return { ...state, topicFilters: action.value };
    case 'setCategory': return { ...state, categoryFilter: action.value };
    case 'setDeadline': return { ...state, deadlineFilter: action.value };
    case 'setPositions': return { ...state, positionFilters: action.value };
    case 'clearAll': return initialFilterState;
    default: return state;
  }
}

function HomeClient({activities} : HomeClientProps) {
  const [lang, setLang] = useState<Lang>('VI');
  const [filters, dispatch] = useReducer(filterReducer, initialFilterState);
  const { searchQuery, topicFilters, categoryFilter, deadlineFilter, positionFilters } = filters;

  // Thin wrappers so children keep receiving plain (value) => void setters.
  const setSearchQuery = (value: string) => dispatch({ type: 'setSearch', value });
  const setTopicFilters = (value: TopicFilter) => dispatch({ type: 'setTopics', value });
  const setCategoryFilter = (value: string) => dispatch({ type: 'setCategory', value });
  const setDeadlineFilter = (value: DeadlineFilter) => dispatch({ type: 'setDeadline', value });
  const setPositionFilters = (value: string[]) => dispatch({ type: 'setPositions', value });

  function handleClearAll(): void {
    dispatch({ type: 'clearAll' });
  }

  function handleTagClick(tag: Tag): void {
    if (tag.type !== 'topic') return;
    const next: TopicFilter = topicFilters.topics.includes(tag.label)
      ? { topics: [], subtopics: [] }
      : { topics: [tag.label], subtopics: [] };
    setTopicFilters(next);
  }

  return (
    <div id="top">
      <Navbar lang={lang} onLangChange={setLang} />
      <HeroSection
        activitiesCount={activities.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        topicFilters={topicFilters}
        onTagClick={handleTagClick}
      />
      <MainContent
        activities={activities}
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
