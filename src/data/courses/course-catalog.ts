import type { Course, CourseId } from '@/types';

import { kitchenBasicsLesson } from '@/data/lessons/kitchen-basics';

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
