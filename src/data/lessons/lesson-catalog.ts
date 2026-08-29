import type { Lesson, LessonId } from '@/types';

import { developmentLesson } from './development-lesson';

const lessons: readonly Lesson[] = [developmentLesson];

export function getLessons(): readonly Lesson[] {
  return lessons;
}

export function getLessonById(lessonId: LessonId): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === lessonId);
}
