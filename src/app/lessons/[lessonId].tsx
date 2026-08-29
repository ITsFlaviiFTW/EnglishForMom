import { useLocalSearchParams } from 'expo-router';

import { AppButton } from '@/components/app-button';
import { AppCard } from '@/components/app-card';
import { ScreenContainer } from '@/components/screen-container';
import { getLessonById } from '@/data/lessons/lesson-catalog';
import { LessonPlayer } from '@/features/lessons/lesson-player';

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const lesson = getLessonById(lessonId);

  if (!lesson) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', gap: 24 }}>
        <AppCard
          title="Lecția nu a fost găsită"
          description="Întoarce-te la lista de lecții și încearcă din nou."
        />
        <AppButton href="/lessons" title="Înapoi la lecții" />
      </ScreenContainer>
    );
  }

  return <LessonPlayer lesson={lesson} />;
}
