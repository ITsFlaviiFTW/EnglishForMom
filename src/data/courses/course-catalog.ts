import type { Course, CourseId } from '@/types';

import { bathroomBasicsLesson } from '../lessons/bathroom-basics.ts';
import { bedroomBasicsLesson } from '../lessons/bedroom-basics.ts';
import { cleaningBasicsLesson } from '../lessons/cleaning-basics.ts';
import { kitchenBasicsLesson } from '../lessons/kitchen-basics.ts';
import { laundryBasicsLesson } from '../lessons/laundry-basics.ts';
import { livingRoomBasicsLesson } from '../lessons/living-room-basics.ts';

const courses: readonly Course[] = [
  {
    id: 'my-home',
    schemaVersion: 1,
    title: {
      english: 'My Home',
      romanian: 'Casa mea',
    },
    descriptionRomanian: 'Engleză practică pentru camerele și activitățile din casă.',
    units: [
      {
        id: 'kitchen',
        title: {
          english: 'Kitchen',
          romanian: 'Bucătărie',
        },
        lessonIds: [kitchenBasicsLesson.id],
      },
      {
        id: 'bathroom',
        title: {
          english: 'Bathroom',
          romanian: 'Baie',
        },
        lessonIds: [bathroomBasicsLesson.id],
      },
      {
        id: 'bedroom',
        title: {
          english: 'Bedroom',
          romanian: 'Dormitor',
        },
        lessonIds: [bedroomBasicsLesson.id],
      },
      {
        id: 'living-room',
        title: {
          english: 'Living Room',
          romanian: 'Sufragerie',
        },
        lessonIds: [livingRoomBasicsLesson.id],
      },
      {
        id: 'laundry',
        title: {
          english: 'Laundry',
          romanian: 'Spălatul rufelor',
        },
        lessonIds: [laundryBasicsLesson.id],
      },
      {
        id: 'cleaning',
        title: {
          english: 'Cleaning',
          romanian: 'Curățenie',
        },
        lessonIds: [cleaningBasicsLesson.id],
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
  return courses.flatMap((course) => course.units.flatMap((unit) => unit.lessonIds));
}
