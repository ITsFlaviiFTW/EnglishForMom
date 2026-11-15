import assert from 'node:assert/strict';
import test from 'node:test';

import { getCourseById, getCourses } from '../src/data/courses/course-catalog.ts';
import {
  getCourseLevelProgress,
  getCourseProgression,
  getUnlockedCourseLessonIds,
} from '../src/features/lessons/course-progression.ts';

const myHome = getCourseById('my-home');
const everydayActions = getCourseById('everyday-actions');

test('starts with only the first published lesson available', () => {
  assert.ok(myHome);
  const progression = getCourseProgression(myHome, []);

  assert.deepEqual(
    progression.map(({ status }) => status),
    ['available', 'locked', 'locked', 'locked', 'locked', 'locked'],
  );
  assert.equal(progression[1].lockReason, 'prerequisite');
});

test('automatically completes the current lesson and unlocks its dependent lesson', () => {
  assert.ok(myHome);
  const progression = getCourseProgression(myHome, ['level-1-kitchen-basics']);

  assert.equal(progression[0].status, 'completed');
  assert.equal(progression[1].status, 'available');
  assert.equal(progression[2].status, 'locked');
});

test('keeps planned content locked even after its prerequisites are complete', () => {
  assert.ok(everydayActions);
  const progression = getCourseProgression(everydayActions, [
    'level-1-cleaning-basics',
    'level-2-essential-verbs-1',
  ]);

  assert.equal(progression[0].status, 'completed');
  assert.equal(progression[1].unit.title.english, 'Essential Verbs II');
  assert.equal(progression[1].status, 'locked');
  assert.equal(progression[1].lockReason, 'planned');
});

test('calculates level progress from published lessons and excludes planned placeholders', () => {
  assert.ok(myHome);
  assert.ok(everydayActions);

  assert.deepEqual(
    getCourseLevelProgress(myHome, ['level-1-kitchen-basics', 'level-1-bathroom-basics']),
    { completedLessons: 2, totalLessons: 6, percentage: 33 },
  );
  assert.deepEqual(getCourseLevelProgress(everydayActions, []), {
    completedLessons: 0,
    totalLessons: 1,
    percentage: 0,
  });
});

test('returns only completed and currently available lesson ids for navigation', () => {
  assert.deepEqual(
    getUnlockedCourseLessonIds(getCourses(), ['level-1-kitchen-basics']),
    ['out-1-help-phrases', 'level-1-kitchen-basics', 'level-1-bathroom-basics'],
  );
});
