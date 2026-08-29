import assert from 'node:assert/strict';
import test from 'node:test';

import { SpeechAudioService } from '../src/services/speech-audio-service.ts';

class DeferredSpeechEngine {
  spoken = [];
  stopResolvers = [];

  speak(text, callbacks) {
    this.spoken.push({ text, callbacks });
    callbacks.onStart();
  }

  stop() {
    return new Promise((resolve) => {
      this.stopResolvers.push(resolve);
    });
  }

  resolveStop(index) {
    this.stopResolvers[index]?.();
  }
}

const firstSource = {
  key: 'first',
  text: 'fridge',
  locale: 'en-US',
};

const secondSource = {
  key: 'second',
  text: 'The milk is in the fridge.',
  locale: 'en-US',
};

test('cancels a stale request so rapid taps cannot overlap speech', async () => {
  const engine = new DeferredSpeechEngine();
  const service = new SpeechAudioService(engine);

  const firstPlayback = service.play(firstSource);
  const secondPlayback = service.play(secondSource);

  engine.resolveStop(0);
  await Promise.resolve();
  assert.equal(engine.spoken.length, 0);

  engine.resolveStop(1);
  await Promise.resolve();
  assert.equal(engine.spoken.length, 1);
  assert.equal(engine.spoken[0].text, secondSource.text);
  assert.equal(engine.spoken[0].callbacks.language, 'en-US');

  engine.spoken[0].callbacks.onDone();
  await Promise.all([firstPlayback, secondPlayback]);
  assert.equal(service.getState(), 'idle');
});

test('stop resolves active playback and clears its state', async () => {
  const engine = new DeferredSpeechEngine();
  const service = new SpeechAudioService(engine);

  const playback = service.play(firstSource);
  engine.resolveStop(0);
  await Promise.resolve();
  assert.equal(service.getState(), 'playing');

  const stopping = service.stop();
  await playback;
  assert.equal(service.getState(), 'idle');

  engine.resolveStop(1);
  await stopping;
});
