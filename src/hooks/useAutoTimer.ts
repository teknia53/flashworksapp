import { useEffect, useRef, useState } from 'react';

interface UseAutoTimerOptions {
  seconds: number;
  isRunning: boolean;
  onTimeout: () => void;
}

export function useAutoTimer({
  seconds,
  isRunning,
  onTimeout,
}: UseAutoTimerOptions) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef(onTimeout);
  timeoutRef.current = onTimeout;

  // Reset when seconds setting changes
  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRemaining(seconds);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          timeoutRef.current();
          return seconds; // Reset for next card
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, seconds]);

  return { remaining };
}
