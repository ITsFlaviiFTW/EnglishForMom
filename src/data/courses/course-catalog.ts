import type { Course, CourseId } from '@/types';

const courses: readonly Course[] = [];

export function getCourses(): readonly Course[] {
  return courses;
}

export function getCourseById(courseId: CourseId): Course | undefined {
  return courses.find((course) => course.id === courseId);
}
