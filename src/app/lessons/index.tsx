import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppCard } from '@/components/app-card';
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
    <ScreenContainer style={styles.screen}>
      <ScreenHeader
        title="Lecții"
        description="Urmează lecțiile în ordine. Fiecare lecție nouă se deschide când o finalizezi pe cea anterioară."
      />

      <View style={styles.levelList}>
        {courses.map((course) => (
          <CourseLevelCard
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

type CourseLevelCardProps = {
  course: Course;
  completedLessonIds: readonly LessonId[];
  lessonProgressById: LearnerProgress['lessons'];
  isLoading: boolean;
};

function CourseLevelCard({
  course,
  completedLessonIds,
  lessonProgressById,
  isLoading,
}: CourseLevelCardProps) {
  const progression = getCourseProgression(course, completedLessonIds);
  const levelProgress = getCourseLevelProgress(course, completedLessonIds);

  return (
    <AppCard
      eyebrow={`Nivelul ${course.level}`}
      title={course.title.romanian}
      description={`${course.title.english} · ${course.descriptionRomanian}`}>
      <View style={styles.cardContent}>
        <View style={styles.levelProgressHeader}>
          <Text style={styles.levelProgressLabel}>Progresul nivelului</Text>
          <Text style={styles.levelProgressCount}>
            {isLoading
              ? 'Se încarcă…'
              : `${levelProgress.completedLessons} din ${levelProgress.totalLessons}`}
          </Text>
        </View>
        <View
          accessibilityLabel={`Progres nivelul ${course.level}: ${levelProgress.completedLessons} din ${levelProgress.totalLessons} lecții finalizate`}
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: levelProgress.totalLessons,
            now: levelProgress.completedLessons,
          }}
          style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${levelProgress.percentage}%` }]} />
        </View>

        <View style={styles.lessonList}>
          {progression.map((entry, index) => (
            <CourseLessonRow
              key={entry.unit.id}
              entry={entry}
              index={index}
              lessonProgress={
                entry.unit.lessonId ? lessonProgressById[entry.unit.lessonId] : undefined
              }
              isLoading={isLoading}
            />
          ))}
        </View>
      </View>
    </AppCard>
  );
}

type CourseLessonRowProps = {
  entry: CourseUnitProgression;
  index: number;
  lessonProgress?: LessonProgress;
  isLoading: boolean;
};

function CourseLessonRow({ entry, index, lessonProgress, isLoading }: CourseLessonRowProps) {
  const { unit, status, lockReason } = entry;
  const statusLabel = getStatusLabel(entry, lessonProgress, isLoading);
  const subtitle = getLessonSubtitle(unit, entry, lessonProgress, isLoading);
  const locked = isLoading || status === 'locked' || !unit.lessonId;

  return (
    <View style={[styles.lessonEntry, index > 0 && styles.lessonEntrySeparated]}>
      <View style={styles.lessonHeading}>
        <Text style={styles.lessonNumber}>Lecția {index + 1}</Text>
        <View
          style={[
            styles.statusBadge,
            status === 'completed'
              ? styles.completedBadge
              : status === 'available' && !isLoading
                ? styles.availableBadge
                : styles.lockedBadge,
          ]}>
          <Text
            style={[
              styles.statusText,
              status === 'completed'
                ? styles.completedText
                : status === 'available' && !isLoading
                  ? styles.availableText
                  : styles.lockedText,
            ]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {!locked && unit.lessonId ? (
        <AppButton
          href={{ pathname: '/lessons/[lessonId]', params: { lessonId: unit.lessonId } }}
          title={unit.title.english}
          subtitle={subtitle}
          variant={status === 'available' ? 'primary' : 'secondary'}
        />
      ) : (
        <AppButton disabled title={unit.title.english} subtitle={subtitle} />
      )}

      {lockReason === 'prerequisite' && !isLoading ? (
        <Text style={styles.lockExplanation}>{getPrerequisiteMessage(unit)}</Text>
      ) : null}
    </View>
  );
}

function getStatusLabel(
  entry: CourseUnitProgression,
  lessonProgress: LessonProgress | undefined,
  isLoading: boolean,
): string {
  if (isLoading) {
    return 'Se încarcă';
  }
  if (entry.status === 'completed') {
    return 'Finalizată';
  }
  if (entry.status === 'available') {
    return lessonProgress ? 'Disponibilă · în progres' : 'Disponibilă';
  }
  return entry.lockReason === 'planned' ? 'Blocată · în pregătire' : 'Blocată';
}

function getLessonSubtitle(
  unit: CourseUnit,
  entry: CourseUnitProgression,
  lessonProgress: LessonProgress | undefined,
  isLoading: boolean,
): string {
  if (isLoading) {
    return `${unit.title.romanian} · Se încarcă progresul…`;
  }
  if (entry.lockReason === 'planned') {
    return `${unit.title.romanian} · Conținut în pregătire`;
  }
  if (entry.status === 'locked') {
    return unit.title.romanian;
  }
  if (entry.status === 'completed') {
    return `${unit.title.romanian} · Reia lecția`;
  }
  if (lessonProgress && unit.lessonId) {
    const lesson = getLessonById(unit.lessonId);
    return `${unit.title.romanian} · Continuă de la pasul ${Math.min(
      lessonProgress.nextActivityIndex + 1,
      lesson?.activities.length ?? lessonProgress.nextActivityIndex + 1,
    )}`;
  }
  return `${unit.title.romanian} · Începe sau continuă lecția`;
}

function getPrerequisiteMessage(unit: CourseUnit): string {
  const prerequisiteTitles = unit.prerequisiteLessonIds.map(
    (lessonId) => courseUnitsByLessonId.get(lessonId)?.title.english ?? lessonId,
  );

  return `Finalizează mai întâi: ${prerequisiteTitles.join(', ')}.`;
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 36,
  },
  levelList: {
    gap: 18,
  },
  cardContent: {
    gap: 20,
  },
  levelProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  levelProgressLabel: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '600',
  },
  levelProgressCount: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
  },
  progressTrack: {
    height: 10,
    overflow: 'hidden',
    backgroundColor: colors.border,
    borderRadius: 5,
    marginTop: -10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  lessonList: {
    gap: 18,
  },
  lessonEntry: {
    gap: 10,
  },
  lessonEntrySeparated: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 18,
  },
  lessonHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  lessonNumber: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  completedBadge: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
  },
  availableBadge: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  lockedBadge: {
    backgroundColor: colors.background,
    borderColor: colors.borderStrong,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  completedText: {
    color: colors.success,
  },
  availableText: {
    color: colors.primary,
  },
  lockedText: {
    color: colors.textMuted,
  },
  lockExplanation: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});
