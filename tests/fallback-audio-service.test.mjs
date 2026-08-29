import assert from 'node:assert/strict';
import test from 'node:test';

import { FallbackAudioService } from '../src/services/fallback-audio-service.ts';

const source = { key: 'kitchen-word-fridge', text: 'fridge', locale: 'en-US' };

class FakeAudioService {
  constructor({ available = true, failure = null } = {}) {
    this.available = available;
    this.failure = failure;
    this.played = [];
    this.stopCount = 0;
  }

  has() {
    return this.available;
  }

  getState() {
    return 'idle';
  }

  async play(audioSource) {
    this.played.push(audioSource);
    if (this.failure) {
      throw this.failure;
    }
  }

  async stop() {
    this.stopCount += 1;
  }
}

test('uses a saved recording when one is available', async () => {
  const prerecorded = new FakeAudioService();
  const deviceSpeech = new FakeAudioService();
  const service = new FallbackAudioService(prerecorded, deviceSpeech);

  await service.play(source);

  assert.deepEqual(prerecorded.played, [source]);
  assert.deepEqual(deviceSpeech.played, []);
});

test('uses device speech when a saved recording is missing', async () => {
  const prerecorded = new FakeAudioService({ available: false });
  const deviceSpeech = new FakeAudioService();
  const service = new FallbackAudioService(prerecorded, deviceSpeech);

  await service.play(source);

  assert.deepEqual(prerecorded.played, []);
  assert.deepEqual(deviceSpeech.played, [source]);
});

test('falls back to device speech if saved playback fails', async () => {
  const prerecorded = new FakeAudioService({ failure: new Error('playback failed') });
  const deviceSpeech = new FakeAudioService();
  const service = new FallbackAudioService(prerecorded, deviceSpeech);

  await service.play(source);

  assert.deepEqual(prerecorded.played, [source]);
  assert.deepEqual(deviceSpeech.played, [source]);
});
