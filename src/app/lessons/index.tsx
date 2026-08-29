import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/app-card';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { colors } from '@/constants/theme';
import { courseOutline } from '@/data/courses/course-outline';

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
            <Text style={styles.topics}>{courseLevel.topics.join('  •  ')}</Text>
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
});
