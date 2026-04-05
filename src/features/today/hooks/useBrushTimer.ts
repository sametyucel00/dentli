import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  BrushCompletionChoice,
  TIMER_DURATION_SECONDS,
  TIMER_QUADRANTS,
} from '@/src/features/today/model';

type UseBrushTimerOptions = {
  onComplete: (completionChoice: BrushCompletionChoice, durationSeconds: number) => Promise<void>;
};

export function useBrushTimer({ onComplete }: UseBrushTimerOptions) {
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [completionPromptVisible, setCompletionPromptVisible] = useState(false);
  const [completedDurationSeconds, setCompletedDurationSeconds] = useState<number | null>(null);
  const previousQuadrantIndexRef = useRef(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((current) => {
        const nextValue = current - 1;

        if (current <= 1) {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setIsRunning(false);
          setCompletedDurationSeconds(TIMER_DURATION_SECONDS);
          setCompletionPromptVisible(true);
          return 0;
        }

        const completedSeconds = TIMER_DURATION_SECONDS - nextValue;
        const nextQuadrantIndex = Math.min(
          TIMER_QUADRANTS.length - 1,
          Math.floor(completedSeconds / (TIMER_DURATION_SECONDS / TIMER_QUADRANTS.length)),
        );

        if (nextQuadrantIndex !== previousQuadrantIndexRef.current) {
          previousQuadrantIndexRef.current = nextQuadrantIndex;
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        return nextValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const completedTimerSeconds = TIMER_DURATION_SECONDS - secondsLeft;

  const progress = useMemo(
    () => completedTimerSeconds / TIMER_DURATION_SECONDS,
    [completedTimerSeconds],
  );

  const activeQuadrantIndex = useMemo(
    () =>
      secondsLeft === 0
        ? TIMER_QUADRANTS.length - 1
        : Math.min(
            TIMER_QUADRANTS.length - 1,
            Math.floor(
              completedTimerSeconds / (TIMER_DURATION_SECONDS / TIMER_QUADRANTS.length),
            ),
          ),
    [completedTimerSeconds, secondsLeft],
  );

  function reset() {
    setIsRunning(false);
    setSecondsLeft(TIMER_DURATION_SECONDS);
    setCompletionPromptVisible(false);
    setCompletedDurationSeconds(null);
    previousQuadrantIndexRef.current = 0;
  }

  function open() {
    setCompletionPromptVisible(false);
    setCompletedDurationSeconds(null);
  }

  function stop() {
    setIsRunning(false);
  }

  function toggleRunning() {
    if (secondsLeft === 0) {
      reset();
    }

    void Haptics.selectionAsync();
    setIsRunning((current) => !current);
  }

  async function confirmCompletion(completionChoice: BrushCompletionChoice) {
    if (!completedDurationSeconds) return;

    await onComplete(completionChoice, completedDurationSeconds);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    reset();
  }

  return {
    isRunning,
    secondsLeft,
    quadrants: TIMER_QUADRANTS,
    progress,
    activeQuadrantIndex,
    completionPromptVisible,
    open,
    stop,
    reset,
    toggleRunning,
    confirmCompletion,
  };
}
