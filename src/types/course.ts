import type { LearningText, LessonId } from './lesson';

export type CourseId = string;
export type CourseUnitId = string;

export type CourseUnit = {
  id: CourseUnitId;
  title: LearningText;
  lessonIds: readonly LessonId[];
};

export type Course = {
  id: CourseId;
  schemaVersion: 1;
  title: LearningText;
  descriptionRomanian: string;
  units: readonly CourseUnit[];
};
