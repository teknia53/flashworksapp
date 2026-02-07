import { useEffect, useRef, useCallback, useState } from 'react';

interface UseAutoTimerOptions {
  seconds: number;
  isRunning: boolean;
  onWordTimeout: () => void;
  onMeaningTimeout: () => void;
  face: 'word' | 'meaning';
}

export function useAutoTimer({
  seconds,
  isRunning,
  onWordTimeout,
  onMeaningTimeout,
  face,
}: UseAutoTimerOptions) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset remaining when face changes or seconds change
  useEffect(() => {
    setRemaining(seconds);
  }, [face, seconds]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (face === 'word') {
            onWordTimeout();
          } else {
            onMeaningTimeout();
          }
          return seconds; // Reset for next phase
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, face, seconds, onWordTimeout, onMeaningTimeout]);

  return { remaining };
}
