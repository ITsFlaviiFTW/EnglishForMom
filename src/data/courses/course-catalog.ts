import type { Course, CourseId } from '@/types';

import { bathroomBasicsLesson } from '../lessons/bathroom-basics.ts';
import { bedroomBasicsLesson } from '../lessons/bedroom-basics.ts';
import { cleaningBasicsLesson } from '../lessons/cleaning-basics.ts';
import { essentialVerbsOneLesson } from '../lessons/essential-verbs-1.ts';
import { kitchenBasicsLesson } from '../lessons/kitchen-basics.ts';
import { laundryBasicsLesson } from '../lessons/laundry-basics.ts';
import { livingRoomBasicsLesson } from '../lessons/living-room-basics.ts';

const courses: readonly Course[] = [
  {
    id: 'my-home',
    schemaVersion: 1,
    level: 1,
    title: {
      english: 'My Home',
      romanian: 'Casa mea',
    },
    descriptionRomanian: 'Engleză practică pentru camerele și activitățile din casă.',
    units: [
      {
        id: 'kitchen',
        title: kitchenBasicsLesson.title,
        lessonId: kitchenBasicsLesson.id,
        prerequisiteLessonIds: [],
        availability: 'published',
      },
      {
        id: 'bathroom',
        title: bathroomBasicsLesson.title,
        lessonId: bathroomBasicsLesson.id,
        prerequisiteLessonIds: [kitchenBasicsLesson.id],
        availability: 'published',
      },
      {
        id: 'bedroom',
        title: bedroomBasicsLesson.title,
        lessonId: bedroomBasicsLesson.id,
        prerequisiteLessonIds: [bathroomBasicsLesson.id],
        availability: 'published',
      },
      {
        id: 'living-room',
        title: livingRoomBasicsLesson.title,
        lessonId: livingRoomBasicsLesson.id,
        prerequisiteLessonIds: [bedroomBasicsLesson.id],
        availability: 'published',
      },
      {
        id: 'laundry',
        title: laundryBasicsLesson.title,
        lessonId: laundryBasicsLesson.id,
        prerequisiteLessonIds: [livingRoomBasicsLesson.id],
        availability: 'published',
      },
      {
        id: 'cleaning',
        title: cleaningBasicsLesson.title,
        lessonId: cleaningBasicsLesson.id,
        prerequisiteLessonIds: [laundryBasicsLesson.id],
        availability: 'published',
      },
    ],
  },
  {
    id: 'everyday-actions',
    schemaVersion: 1,
    level: 2,
    title: {
      english: 'Everyday Actions',
      romanian: 'Acțiuni de zi cu zi',
    },
    descriptionRomanian: 'Verbe și propoziții practice pentru situații obișnuite.',
    units: [
      {
        id: 'essential-verbs-1',
        title: essentialVerbsOneLesson.title,
        lessonId: essentialVerbsOneLesson.id,
        prerequisiteLessonIds: [cleaningBasicsLesson.id],
        availability: 'published',
      },
      {
        id: 'essential-verbs-2',
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
