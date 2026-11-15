import type { LearningText, LessonId } from './lesson';

export type CourseId = string;
export type CourseUnitId = string;
export type CourseUnitAvailability = 'published' | 'planned';

export type CourseUnit = {
  id: CourseUnitId;
  /** A familiar picture (emoji) that helps recognise the lesson at a glance. */
  icon?: string;
  title: LearningText;
  lessonId: LessonId | null;
  prerequisiteLessonIds: readonly LessonId[];
  availability: CourseUnitAvailability;
};

export type Course = {
  id: CourseId;
  schemaVersion: 1;
  icon?: string;
  level: number;
  title: LearningText;
  descriptionRomanian: string;
  units: readonly CourseUnit[];
};
