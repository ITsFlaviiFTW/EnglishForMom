import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { ProgressBar } from '@/components/progress-bar';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { colors } from '@/constants/theme';
import { getCourses } from '@/data/courses/course-catalog';
import { getLessonById } from '@/data/lessons/lesson-catalog';
import {
  getCourseLevelProgress,
  getCourseProgression,
  type CourseUnitProgression,
} from '@/features/lessons/course-progression';
import { useLearningProgress } from '@/hooks/use-learning-progress';
import type { Course, CourseUnit, LearnerProgress, LessonId, LessonProgress } from '@/types';

const courses = getCourses();
const courseUnitsByLessonId = new Map(
  courses.flatMap((course) =>
    course.units.flatMap((unit) => (unit.lessonId ? [[unit.lessonId, unit] as const] : [])),
  ),
);

export default function LessonsScreen() {
  const { progress, isLoading } = useLearningProgress();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Lecții"
        description="Mergi în ordine. Fiecare lecție se deschide după cea dinainte."
      />

      <View style={styles.levelList}>
        {courses.map((course) => (
          <CourseSection
            key={course.id}
            course={course}
            completedLessonIds={progress.completedLessonIds}
            lessonProgressById={progress.lessons}
            isLoading={isLoading}
          />
        ))}
      </View>
    </ScreenContainer>
  );
}

function CourseSection({
  course,
  completedLessonIds,
  lessonProgressById,
  isLoading,
}: {
  course: Course;
  completedLessonIds: readonly LessonId[];
  lessonProgressById: LearnerProgress['lessons'];
  isLoading: boolean;
}) {
  const progression = getCourseProgression(course, completedLessonIds);
  const levelProgress = getCourseLevelProgress(course, completedLessonIds);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.levelLabel}>NIVELUL {course.level}</Text>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {course.icon ? `${course.icon}  ` : ''}
          {course.title.romanian}
        </Text>
        <Text style={styles.sectionDescription}>{course.descriptionRomanian}</Text>
        <View style={styles.levelProgress}>
          <ProgressBar
            accessibilityLabel={`${levelProgress.completedLessons} din ${levelProgress.totalLessons} lecții terminate`}
            max={levelProgress.totalLessons}
            style={styles.levelProgressBar}
            value={levelProgress.completedLessons}
          />
          <Text style={styles.levelProgressText}>
            {isLoading ? '…' : `${levelProgress.completedLessons}/${levelProgress.totalLessons}`}
          </Text>
        </View>
      </View>

      <View style={styles.lessonList}>
        {progression.map((entry) => (
          <LessonRow
            key={entry.unit.id}
            entry={entry}
            lessonProgress={entry.unit.lessonId ? lessonProgressById[entry.unit.lessonId] : undefined}
            isLoading={isLoading}
          />
        ))}
      </View>
    </View>
  );
}

function LessonRow({
  entry,
  lessonProgress,
  isLoading,
}: {
  entry: CourseUnitProgression;
  lessonProgress?: LessonProgress;
  isLoading: boolean;
}) {
  const { unit, status } = entry;
  const subtitle = getLessonSubtitle(entry, lessonProgress, isLoading);
  const locked = isLoading || status === 'locked' || !unit.lessonId;

  if (locked || !unit.lessonId) {
    return (
      <AppButton
        disabled
        icon={status === 'locked' ? '🔒' : unit.icon}
        subtitle={subtitle}
        title={unit.title.romanian}
      />
    );
  }

  return (
    <AppButton
      badge={status === 'completed' ? '✓' : undefined}
      badgeTone="success"
      href={{ pathname: '/lessons/[lessonId]', params: { lessonId: unit.lessonId } }}
      icon={unit.icon}
      subtitle={subtitle}
      title={unit.title.romanian}
      variant={status === 'available' ? 'primary' : 'secondary'}
    />
  );
}

function getLessonSubtitle(
  entry: CourseUnitProgression,
  lessonProgress: LessonProgress | undefined,
  isLoading: boolean,
): string {
  const { unit } = entry;

  if (isLoading) {
    return 'Se încarcă…';
  }
  if (entry.lockReason === 'planned') {
    return 'În pregătire';
  }
  if (entry.status === 'locked') {
    return getPrerequisiteMessage(unit);
  }
  if (entry.status === 'completed') {
    return `${unit.title.english} · Terminată, o poți repeta`;
  }
  if (lessonProgress && unit.lessonId) {
    const lesson = getLessonById(unit.lessonId);
    const step = Math.min(
      lessonProgress.nextActivityIndex + 1,
      lesson?.activities.length ?? lessonProgress.nextActivityIndex + 1,
    );
    return `Continuă de la pasul ${step}`;
  }
  return `${unit.title.english} · Începe aici`;
}

function getPrerequisiteMessage(unit: CourseUnit): string {
  const prerequisiteTitles = unit.prerequisiteLessonIds.map(
    (lessonId) => courseUnitsByLessonId.get(lessonId)?.title.romanian ?? lessonId,
  );

  return `Se deschide după: ${prerequisiteTitles.join(', ')}`;
}

const styles = StyleSheet.create({
  levelList: {
    gap: 36,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    gap: 4,
  },
  levelLabel: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 33,
    fontWeight: '800',
  },
  sectionDescription: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 25,
  },
  levelProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  levelProgressBar: {
    flex: 1,
  },
  levelProgressText: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    minWidth: 36,
    textAlign: 'right',
  },
  lessonList: {
    gap: 12,
  },
});
