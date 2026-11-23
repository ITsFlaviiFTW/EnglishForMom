import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  AudioPlaybackState,
  AudioPlayOptions,
  AudioService,
} from '@/services/audio-service';
import type { AudioSource } from '@/types';

export function useAudioPlayback(audioService: AudioService, activityId: string | undefined) {
  const [playback, setPlayback] = useState<{
    activityId: string | undefined;
    state: AudioPlaybackState;
    errorMessage: string | null;
  }>({ activityId, state: 'idle', errorMessage: null });
  const requestId = useRef(0);

  const stop = useCallback(async () => {
    requestId.current += 1;
    setPlayback({ activityId, state: 'idle', errorMessage: null });
    await audioService.stop();
  }, [activityId, audioService]);

  const play = useCallback(
    async (source: AudioSource, options?: AudioPlayOptions) => {
      const currentRequestId = ++requestId.current;
      setPlayback({ activityId, state: 'loading', errorMessage: null });

      const playback = audioService.play(source, options);
      setPlayback({ activityId, state: 'playing', errorMessage: null });

      try {
        await playback;
      } catch {
        if (currentRequestId === requestId.current) {
          setPlayback({
            activityId,
            state: 'idle',
            // A card that could not start its word by itself just waits for a tap.
            errorMessage: options?.automatic
              ? null
              : 'Pronunția nu este disponibilă pe acest dispozitiv.',
          });
        }
      } finally {
        if (currentRequestId === requestId.current) {
          setPlayback((current) => ({ ...current, state: 'idle' }));
        }
      }
    },
    [activityId, audioService],
  );

  useEffect(
    () => () => {
      requestId.current += 1;
      void audioService.stop();
    },
    [activityId, audioService],
  );

  const isCurrentActivity = playback.activityId === activityId;

  return {
    state: isCurrentActivity ? playback.state : 'idle',
    errorMessage: isCurrentActivity ? playback.errorMessage : null,
    play,
    stop,
  };
}
