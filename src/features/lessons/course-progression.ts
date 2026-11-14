import type { Course, CourseUnit, LessonId } from '@/types';

export type CourseUnitStatus = 'locked' | 'available' | 'completed';

export type CourseUnitProgression = {
  unit: CourseUnit;
  status: CourseUnitStatus;
  lockReason: 'prerequisite' | 'planned' | null;
};

export type CourseLevelProgress = {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
};

export function getCourseUnitProgression(
  unit: CourseUnit,
  completedLessonIds: readonly LessonId[],
): CourseUnitProgression {
  if (unit.lessonId && completedLessonIds.includes(unit.lessonId)) {
    return { unit, status: 'completed', lockReason: null };
  }

  if (unit.availability === 'planned' || !unit.lessonId) {
    return { unit, status: 'locked', lockReason: 'planned' };
  }

  const prerequisitesComplete = unit.prerequisiteLessonIds.every((lessonId) =>
    completedLessonIds.includes(lessonId),
  );

  return prerequisitesComplete
    ? { unit, status: 'available', lockReason: null }
    : { unit, status: 'locked', lockReason: 'prerequisite' };
}

export function getCourseProgression(
  course: Course,
  completedLessonIds: readonly LessonId[],
): readonly CourseUnitProgression[] {
  return course.units.map((unit) => getCourseUnitProgression(unit, completedLessonIds));
}

export function getCourseLevelProgress(
  course: Course,
  completedLessonIds: readonly LessonId[],
): CourseLevelProgress {
  const publishedLessonIds = course.units.flatMap((unit) =>
    unit.availability === 'published' && unit.lessonId ? [unit.lessonId] : [],
  );
  const completedLessons = publishedLessonIds.filter((lessonId) =>
    completedLessonIds.includes(lessonId),
  ).length;
  const totalLessons = publishedLessonIds.length;

  return {
    completedLessons,
    totalLessons,
    percentage: totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
  };
}

export function getUnlockedCourseLessonIds(
  courses: readonly Course[],
  completedLessonIds: readonly LessonId[],
): readonly LessonId[] {
  return courses.flatMap((course) =>
    getCourseProgression(course, completedLessonIds).flatMap(({ unit, status }) =>
      unit.lessonId && status !== 'locked' ? [unit.lessonId] : [],
    ),
  );
}
