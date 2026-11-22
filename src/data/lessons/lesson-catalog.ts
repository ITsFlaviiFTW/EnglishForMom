import type { Lesson, LessonId } from '@/types';

import { bathroomBasicsLesson } from './bathroom-basics.ts';
import { bedroomBasicsLesson } from './bedroom-basics.ts';
import { cleaningBasicsLesson } from './cleaning-basics.ts';
import { conversationLessons } from './conversations.ts';
import { developmentLesson } from './development-lesson.ts';
import { essentialVerbsOneLesson } from './essential-verbs-1.ts';
import { kitchenBasicsLesson } from './kitchen-basics.ts';
import { laundryBasicsLesson } from './laundry-basics.ts';
import { livingRoomBasicsLesson } from './living-room-basics.ts';
import { atTheStoreLesson } from './out-at-the-store.ts';
import { checkoutLesson } from './out-checkout.ts';
import { helpPhrasesLesson } from './out-help-phrases.ts';
import { pricesLesson } from './out-prices.ts';

const lessons: readonly Lesson[] = [
  helpPhrasesLesson,
  pricesLesson,
  atTheStoreLesson,
  checkoutLesson,
  ...conversationLessons,
  kitchenBasicsLesson,
  bathroomBasicsLesson,
  bedroomBasicsLesson,
  livingRoomBasicsLesson,
  laundryBasicsLesson,
  cleaningBasicsLesson,
  essentialVerbsOneLesson,
  developmentLesson,
];

export function getLessons(): readonly Lesson[] {
  return lessons;
}

export function getLessonById(lessonId: LessonId): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === lessonId);
}
