import type { Lesson, LessonId } from '@/types';

const lessons: readonly Lesson[] = [];

export function getLessons(): readonly Lesson[] {
  return lessons;
}

export function getLessonById(lessonId: LessonId): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === lessonId);
}
