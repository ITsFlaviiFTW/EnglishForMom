import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppCard } from '@/components/app-card';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { colors } from '@/constants/theme';
import { courseOutline } from '@/data/courses/course-outline';
import { developmentLesson } from '@/data/lessons/development-lesson';

export default function LessonsScreen() {
  return (
    <ScreenContainer style={styles.screen}>
      <ScreenHeader
        title="Lecții"
        description="Începem cu engleza pe care o folosești acasă, apoi continuăm treptat."
      />

      <View style={styles.list}>
        {courseOutline.map((courseLevel) => (
          <AppCard
            key={courseLevel.id}
            eyebrow={`${courseLevel.level}${courseLevel.available ? ' · Disponibil în curând' : ' · Planificat'}`}
            title={courseLevel.title}
            description={courseLevel.description}>
            <View style={styles.cardContent}>
              <Text style={styles.topics}>{courseLevel.topics.join('  •  ')}</Text>
              {courseLevel.available ? (
                <AppButton
                  href={{
                    pathname: '/lessons/[lessonId]',
                    params: { lessonId: developmentLesson.id },
                  }}
                  title="Încearcă lecția demonstrativă"
                  variant="primary"
                />
              ) : null}
            </View>
          </AppCard>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 36,
  },
  list: {
    gap: 16,
  },
  topics: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 25,
  },
  cardContent: {
    gap: 18,
  },
});
