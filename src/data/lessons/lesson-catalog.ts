import type { Lesson, LessonId } from '@/types';

import { developmentLesson } from './development-lesson';
import { kitchenBasicsLesson } from './kitchen-basics';

const lessons: readonly Lesson[] = [kitchenBasicsLesson, developmentLesson];

export function getLessons(): readonly Lesson[] {
  return lessons;
}

export function getLessonById(lessonId: LessonId): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === lessonId);
}
