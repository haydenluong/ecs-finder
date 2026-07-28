export type Lang = 'VI' | 'EN';
export type DeadlineFilter = '' | 'week' | 'month';

export interface SubtopicFilter {
  parent: string;
  subtopic: string;
}

export interface TopicFilter {
  topics: string[];
  subtopics: SubtopicFilter[];
}

export interface Topic {
  name: string;
  subtopics: string[];
}

export interface CategoryTag {
  label: string;
  type: 'category';
}

export interface TopicTag {
  label: string;
  type: 'topic';
}

export interface SubtopicTag {
  label: string;
  type: 'subtopic';
  parent: string;
}

export type Tag = CategoryTag | TopicTag | SubtopicTag;

export interface Activity {
  id: number;
  name: string;
  category: string;
  topic: string;
  subtopic: string | null;
  location: string;
  deadline: string;
  positions: string[];
  desc: string;
  image: string;
  link: string;
}
