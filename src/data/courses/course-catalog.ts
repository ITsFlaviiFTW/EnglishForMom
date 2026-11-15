import type { Course, CourseId } from '@/types';

import { bathroomBasicsLesson } from '../lessons/bathroom-basics.ts';
import { bedroomBasicsLesson } from '../lessons/bedroom-basics.ts';
import { cleaningBasicsLesson } from '../lessons/cleaning-basics.ts';
import { essentialVerbsOneLesson } from '../lessons/essential-verbs-1.ts';
import { kitchenBasicsLesson } from '../lessons/kitchen-basics.ts';
import { laundryBasicsLesson } from '../lessons/laundry-basics.ts';
import { livingRoomBasicsLesson } from '../lessons/living-room-basics.ts';
import { atTheStoreLesson } from '../lessons/out-at-the-store.ts';
import { checkoutLesson } from '../lessons/out-checkout.ts';
import { helpPhrasesLesson } from '../lessons/out-help-phrases.ts';
import { pricesLesson } from '../lessons/out-prices.ts';

const courses: readonly Course[] = [
  {
    // First, because understanding people at the store is the main goal.
    id: 'out-and-about',
    icon: '🛒',
    schemaVersion: 1,
    level: 1,
    title: {
      english: 'Out and About',
      romanian: 'În oraș',
    },
    descriptionRomanian:
      'Engleză pentru magazin și pentru când îți vorbesc oamenii, cu dialoguri la viteză normală.',
    units: [
      {
        id: 'help-phrases',
        icon: '🙋',
        title: helpPhrasesLesson.title,
        lessonId: helpPhrasesLesson.id,
        prerequisiteLessonIds: [],
        availability: 'published',
      },
      {
        id: 'prices',
        icon: '💵',
        title: pricesLesson.title,
        lessonId: pricesLesson.id,
        prerequisiteLessonIds: [helpPhrasesLesson.id],
        availability: 'published',
      },
      {
        id: 'at-the-store',
        icon: '🛒',
        title: atTheStoreLesson.title,
        lessonId: atTheStoreLesson.id,
        prerequisiteLessonIds: [pricesLesson.id],
        availability: 'published',
      },
      {
        id: 'checkout',
        icon: '🧾',
        title: checkoutLesson.title,
        lessonId: checkoutLesson.id,
        prerequisiteLessonIds: [atTheStoreLesson.id],
        availability: 'published',
      },
    ],
  },
  {
    id: 'my-home',
    icon: '🏠',
    schemaVersion: 1,
    level: 2,
    title: {
      english: 'My Home',
      romanian: 'Casa mea',
    },
    descriptionRomanian: 'Engleză practică pentru camerele și activitățile din casă.',
    units: [
      {
        id: 'kitchen',
        icon: '🍳',
        title: kitchenBasicsLesson.title,
        lessonId: kitchenBasicsLesson.id,
        prerequisiteLessonIds: [],
        availability: 'published',
      },
      {
        id: 'bathroom',
        icon: '🛁',
        title: bathroomBasicsLesson.title,
        lessonId: bathroomBasicsLesson.id,
        prerequisiteLessonIds: [kitchenBasicsLesson.id],
        availability: 'published',
      },
      {
        id: 'bedroom',
        icon: '🛏️',
        title: bedroomBasicsLesson.title,
        lessonId: bedroomBasicsLesson.id,
        prerequisiteLessonIds: [bathroomBasicsLesson.id],
        availability: 'published',
      },
      {
        id: 'living-room',
        icon: '🛋️',
        title: livingRoomBasicsLesson.title,
        lessonId: livingRoomBasicsLesson.id,
        prerequisiteLessonIds: [bedroomBasicsLesson.id],
        availability: 'published',
      },
      {
        id: 'laundry',
        icon: '🧺',
        title: laundryBasicsLesson.title,
        lessonId: laundryBasicsLesson.id,
        prerequisiteLessonIds: [livingRoomBasicsLesson.id],
        availability: 'published',
      },
      {
        id: 'cleaning',
        icon: '🧹',
        title: cleaningBasicsLesson.title,
        lessonId: cleaningBasicsLesson.id,
        prerequisiteLessonIds: [laundryBasicsLesson.id],
        availability: 'published',
      },
    ],
  },
  {
    id: 'everyday-actions',
    icon: '✋',
    schemaVersion: 1,
    level: 3,
    title: {
      english: 'Everyday Actions',
      romanian: 'Acțiuni de zi cu zi',
    },
    descriptionRomanian: 'Verbe și propoziții practice pentru situații obișnuite.',
    units: [
      {
        id: 'essential-verbs-1',
        icon: '✋',
        title: essentialVerbsOneLesson.title,
        lessonId: essentialVerbsOneLesson.id,
        prerequisiteLessonIds: [cleaningBasicsLesson.id],
        availability: 'published',
      },
      {
        id: 'essential-verbs-2',
        icon: '🗣️',
        title: {
          english: 'Essential Verbs II',
          romanian: 'Verbe esențiale II',
        },
        lessonId: null,
        prerequisiteLessonIds: [essentialVerbsOneLesson.id],
        availability: 'planned',
      },
    ],
  },
];

export function getCourses(): readonly Course[] {
  return courses;
}

export function getCourseById(courseId: CourseId): Course | undefined {
  return courses.find((course) => course.id === courseId);
}

export function getCourseLessonIds() {
  return courses.flatMap((course) =>
    course.units.flatMap((unit) => (unit.lessonId ? [unit.lessonId] : [])),
  );
}

export function getCourseUnitByLessonId(lessonId: string) {
  for (const course of courses) {
    const unit = course.units.find((candidate) => candidate.lessonId === lessonId);
    if (unit) {
      return unit;
    }
  }

  return undefined;
}
