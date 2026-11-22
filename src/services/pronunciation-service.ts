import {
  createAssessmentHeader,
  type AzurePronunciationResponse,
} from '@/features/speaking/pronunciation';

/**
 * Same-origin endpoint. The web server forwards the recording to Azure's speech
 * recognition and adds the Azure key there (deploy/nginx-prava.conf), so the
 * key never reaches the phone.
 */
export const PRONUNCIATION_ENDPOINT = '/api/pronunciation';
const TIMEOUT_MS = 20000;

export class PronunciationCheckError extends Error {
  constructor(readonly reason: 'offline' | 'busy' | 'unavailable') {
    super(`Pronunciation check ${reason}`);
  }
}

export async function assessPronunciation(
  wav: Uint8Array,
  referenceText: string,
): Promise<AzurePronunciationResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(PRONUNCIATION_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
        'Pronunciation-Assessment': createAssessmentHeader(referenceText),
      },
      body: wav as BodyInit,
      signal: controller.signal,
    });
  } catch {
    throw new PronunciationCheckError('offline');
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 429) {
    throw new PronunciationCheckError('busy');
  }
  if (!response.ok) {
    throw new PronunciationCheckError('unavailable');
  }
  try {
    return (await response.json()) as AzurePronunciationResponse;
  } catch {
    throw new PronunciationCheckError('unavailable');
  }
}
