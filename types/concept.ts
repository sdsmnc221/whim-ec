export interface TimelineRef {
  year: number;
  year_end: number | null;
}

export interface ConceptEntry {
  id: string;
  slug: string;
  title: string;
  definition: string;
  key_points: string[];
  thematic_links: string;
  themes: string[];
  timeline_refs: TimelineRef[];
}

export interface ConceptProgress {
  conceptId: string;
  seen: boolean;
  bookmarked: boolean;
}
