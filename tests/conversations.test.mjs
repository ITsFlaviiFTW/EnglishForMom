import assert from 'node:assert/strict';
import test from 'node:test';

import {
  dialogueAudioSources,
  generatedEnglishAudioSources,
} from '../src/data/audio/english-audio-catalog.ts';
import { romanianAccentRespellings } from '../src/data/audio/romanian-accent-respellings.ts';
import { getCourseById, getCourses } from '../src/data/courses/course-catalog.ts';
import { getLessonById } from '../src/data/lessons/lesson-catalog.ts';
import { conversationPartnerAudioSources } from '../src/data/lessons/conversations.ts';
import {
  createDefaultProgress,
  recordActivityCompletion,
} from '../src/features/progress/progress-state.ts';
import {
  getSpeakingTarget,
  skipSpeaking,
  speakingCompletion,
} from '../src/features/speaking/speaking-gate.ts';

const course = getCourseById('conversations');
const lessons = course.units.map((unit) => getLessonById(unit.lessonId));
const lessonAudioKeys = new Set(generatedEnglishAudioSources.map((source) => source.key));
const partnerAudioKeys = new Set(dialogueAudioSources.map((source) => source.key));

test('"Conversații" comes right after "În oraș", opens with its first conversation, and is chained', () => {
  assert.deepEqual(
    getCourses().map((candidate) => candidate.id).slice(0, 2),
    ['out-and-about', 'conversations'],
  );
  assert.equal(course.level, 2);
  assert.ok(lessons.length >= 8);
  assert.deepEqual(course.units[0].prerequisiteLessonIds, []);
  for (let index = 1; index < course.units.length; index += 1) {
    assert.deepEqual(course.units[index].prerequisiteLessonIds, [course.units[index - 1].lessonId]);
  }
  for (const unit of course.units) {
    assert.ok(unit.icon, `${unit.lessonId} has an icon`);
  }
});

test('she talks with several different people and voices, not just the cashier', () => {
  const partners = new Set(lessons.map((lesson) => lesson.activities[0].partner.nameRomanian));
  assert.ok(partners.size >= 8);
  const voices = new Set(conversationPartnerAudioSources.map((source) => source.staffVoice));
  assert.deepEqual([...voices].sort(), ['female', 'female-2', 'male', 'male-2']);
});

for (const lesson of lessons) {
  test(`${lesson.title.english}: every turn can be heard, read the Romanian way, and said`, () => {
    let spokenSoFar = 0;
    lesson.activities.forEach((activity, index) => {
      assert.equal(activity.type, 'conversation-turn');
      assert.equal(Boolean(activity.instructionRomanian), index === 0);
      assert.ok(activity.taskRomanian && activity.response.english && activity.response.romanian);

      // Her answer: recorded, with a "Se citește" spelling, and checked by the microphone.
      assert.ok(lessonAudioKeys.has(activity.responseAudio.key), activity.responseAudio.key);
      assert.ok(romanianAccentRespellings[activity.response.english], activity.response.english);
      assert.equal(getSpeakingTarget(activity).text, activity.response.english);

      // The other person: recorded at real speed (absent only when she speaks first).
      if (activity.partnerLines.length > 0) {
        assert.ok(partnerAudioKeys.has(activity.partnerAudio.key), activity.partnerAudio.key);
      } else {
        assert.equal(activity.partnerAudio, undefined);
      }
      if (activity.closingLines) {
        assert.equal(index, lesson.activities.length - 1);
        assert.ok(partnerAudioKeys.has(activity.closingAudio.key));
      }

      // The history is everything said before this turn.
      assert.equal(activity.history.length, spokenSoFar);
      spokenSoFar += activity.partnerLines.length + 1;

      const romanian = [
        activity.taskRomanian,
        activity.response.romanian,
        activity.instructionRomanian ?? '',
        ...activity.partnerLines.map((line) => line.romanian),
      ].join(' ');
      assert.doesNotMatch(romanian, /[şţŞŢ]/);
    });
  });
}

test('conversation audio keys are unique', () => {
  const keys = [...generatedEnglishAudioSources, ...dialogueAudioSources].map((source) => source.key);
  assert.equal(new Set(keys).size, keys.length);
});

test('an answer she skips goes to review; one she says right counts as correct', () => {
  const lesson = lessons[0];
  const turn = lesson.activities[1];
  const completedAt = '2026-11-21T12:00:00.000Z';

  const skipped = recordActivityCompletion(createDefaultProgress(), {
    lesson,
    activity: turn,
    ...speakingCompletion(skipSpeaking({ attempts: 5, status: 'trying' })),
    completedAt,
  });
  const item = skipped.reviewItems[`comprehension:${lesson.id}:${turn.id}`];
  assert.ok(item);
  assert.equal(item.content.english, turn.response.english);

  const passed = recordActivityCompletion(createDefaultProgress(), {
    lesson,
    activity: turn,
    ...speakingCompletion({ attempts: 1, status: 'passed' }),
    completedAt,
  });
  assert.deepEqual(passed.reviewItems, {});
  assert.equal(passed.correctAnswers, 1);
});
