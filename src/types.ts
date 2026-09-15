export type Lang = 'VI' | 'EN';

/** The statuses the /admin queue can be filtered to. 'archived' is not reachable from the UI. */
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
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

export interface ImagePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

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

  // Written by /api/admin/decide at approval time. null means not translated —
  // the read path renders `desc_en ?? desc`, so it must not be read as empty.
  desc_en?: string | null;

  image: string;
  image_position?: ImagePosition | null;
  link: string;
  status?: "pending" | "approved" | "rejected" | "archived";

  email?: string | null;

  // Automated check results from /api/submit, shown to a reviewer on /admin.
  // null means "not checked" — the row predates the column, or the check itself
  // failed (both fail open), so it must not be read as a pass.
  link_check_passed?: boolean | null;
  content_check_verdict?: "ok" | "spam" | "review" | null;
  content_check_reason?: string | null;

  // Written by /api/admin/decide. reviewed_by is the approver's ADMIN_USERS label.
  reviewed_by?: string | null;
  reviewed_at?: string | null;
}
