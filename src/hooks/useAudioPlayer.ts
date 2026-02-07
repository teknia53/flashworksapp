import { useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

/**
 * Audio player hook for pronunciation playback.
 * Audio files are optional — silently skips if not bundled.
 * Expected path structure: assets/audio/chptXX/words/{filename}.mp3
 */
export function useAudioPlayer() {
  const soundRef = useRef<Audio.Sound | null>(null);

  const unload = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  }, []);

  const play = useCallback(async (filename: string, chapter: number) => {
    if (!filename) return;

    await unload();

    // For now, audio files are not bundled. This hook is ready for when
    // audio assets are added to assets/audio/chptXX/words/{filename}.mp3
    // The app will need a mapping or require() context for bundled audio.
    // This is a no-op placeholder that won't crash the app.
    try {
      // Future: load audio from bundled assets or document directory
      // const chptDir = `chpt${String(chapter).padStart(2, '0')}`;
      // const { sound } = await Audio.Sound.createAsync(
      //   require(`../../assets/audio/${chptDir}/words/${filename}.mp3`)
      // );
      // soundRef.current = sound;
      // await sound.playAsync();
    } catch {
      // Audio file not found — silently skip
    }
  }, [unload]);

  const stop = useCallback(async () => {
    await unload();
  }, [unload]);

  return { play, stop };
}
