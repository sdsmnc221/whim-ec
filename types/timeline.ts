export interface TimelineEntry {
  year: number;
  year_end: number | null;
  label: string;
  explication: string;
  explications: string[];
  theme: string;
  question_ids: string[];
  quiz_capable: boolean;
}
