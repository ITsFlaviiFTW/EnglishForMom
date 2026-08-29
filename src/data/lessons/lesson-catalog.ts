import type { Lesson, LessonId } from '@/types';

import { bathroomBasicsLesson } from './bathroom-basics.ts';
import { bedroomBasicsLesson } from './bedroom-basics.ts';
import { cleaningBasicsLesson } from './cleaning-basics.ts';
import { developmentLesson } from './development-lesson.ts';
import { kitchenBasicsLesson } from './kitchen-basics.ts';
import { laundryBasicsLesson } from './laundry-basics.ts';
import { livingRoomBasicsLesson } from './living-room-basics.ts';

const lessons: readonly Lesson[] = [
  kitchenBasicsLesson,
  bathroomBasicsLesson,
  bedroomBasicsLesson,
  livingRoomBasicsLesson,
  laundryBasicsLesson,
  cleaningBasicsLesson,
  developmentLesson,
];

export function getLessons(): readonly Lesson[] {
  return lessons;
}

export function getLessonById(lessonId: LessonId): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === lessonId);
}
