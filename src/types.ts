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

export type Tag = CategoryTag | TopicTag;

export interface Activity {
  id: number;
  created_at?: string;
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
  status?: "pending" | "approved" | "rejected" | "archived"; 
}
