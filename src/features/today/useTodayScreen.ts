import { useCallback, useEffect, useMemo, useState } from 'react';

import { DailyActionKey, SymptomType, ToothStatus } from '@/src/domain/models';
import { useFocusedAsyncEffect } from '@/src/hooks/useFocusedAsyncEffect';
import {
  TODAY_INITIAL_ACTION_STATE,
  TODAY_INITIAL_QUICK_STATUS,
  TODAY_ACTIONS,
  TodayActionState,
  TodayInsight,
  TodayQuickStatus,
  TodaySheetMode,
} from '@/src/features/today/model';
import { createDefaultAppointmentDateTime } from '@/src/features/appointments/model';
import { useBrushTimer } from '@/src/features/today/hooks/useBrushTimer';
import { todayService } from '@/src/features/today/today-service';

function createTodayActionState(
  actionState: Record<DailyActionKey, { id: string } | null>,
): TodayActionState {
  return {
    morning_brush: {
      completed: Boolean(actionState.morning_brush),
      eventId: actionState.morning_brush?.id ?? null,
    },
    night_brush: {
      completed: Boolean(actionState.night_brush),
      eventId: actionState.night_brush?.id ?? null,
    },
    floss: {
      completed: Boolean(actionState.floss),
      eventId: actionState.floss?.id ?? null,
    },
    mouthwash: {
      completed: Boolean(actionState.mouthwash),
      eventId: actionState.mouthwash?.id ?? null,
    },
  };
}

export function useTodayScreen(profileId: string | null, isFocused: boolean) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickStatus, setQuickStatus] = useState<TodayQuickStatus>(TODAY_INITIAL_QUICK_STATUS);
  const [insights, setInsights] = useState<TodayInsight[]>([]);
  const [actionState, setActionState] = useState<TodayActionState>(TODAY_INITIAL_ACTION_STATE);
  const [mouthwashEnabled, setMouthwashEnabled] = useState(false);
  const [brushingFrequencyPerDay, setBrushingFrequencyPerDay] = useState<1 | 2>(2);
  const [sheetMode, setSheetMode] = useState<TodaySheetMode>(null);
  const [symptomType, setSymptomType] = useState<SymptomType>('sensitivity');
  const [symptomSeverity, setSymptomSeverity] = useState<number | null>(null);
  const [symptomTooth, setSymptomTooth] = useState('');
  const [symptomNote, setSymptomNote] = useState('');
  const [appointmentTitle, setAppointmentTitle] = useState('');
  const [appointmentProvider, setAppointmentProvider] = useState('');
  const [appointmentStartsAt, setAppointmentStartsAt] = useState(createDefaultAppointmentDateTime());
  const [toothNumber, setToothNumber] = useState('');
  const [toothStatus, setToothStatus] = useState<ToothStatus>('healthy');
  const [toothNote, setToothNote] = useState('');
  const [actionFeedback, setActionFeedback] = useState<{
    actionKey: DailyActionKey;
    completed: boolean;
  } | null>(null);

  const reload = useCallback(async () => {
    if (!profileId) {
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await todayService.load(profileId);

      setQuickStatus(data.quickStatus);
      setInsights(data.insights);
      setMouthwashEnabled(Boolean(data.snapshot.routineSettings?.mouthwashEnabled));
      setBrushingFrequencyPerDay(
        (data.snapshot.routineSettings?.brushingFrequencyPerDay as 1 | 2 | undefined) ?? 2,
      );
      setActionState(createTodayActionState(data.actionState));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load today view.');
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useFocusedAsyncEffect(isFocused, reload);

  const brushTimer = useBrushTimer({
    onComplete: async (completionChoice, durationSeconds) => {
      if (!profileId) return;

      await todayService.completeBrushTimer(profileId, completionChoice, durationSeconds);
      await reload();
    },
  });

  const visibleActions = useMemo(
    () =>
      TODAY_ACTIONS.filter((action) => {
        if (action.key === 'night_brush' && brushingFrequencyPerDay === 1) {
          return false;
        }

        return action.key !== 'mouthwash' || mouthwashEnabled;
      }),
    [brushingFrequencyPerDay, mouthwashEnabled],
  );

  useEffect(() => {
    if (!actionFeedback) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setActionFeedback(null);
    }, 3200);

    return () => clearTimeout(timeoutId);
  }, [actionFeedback]);

  async function runMutation(task: () => Promise<void>, options?: { onSuccess?: () => void }) {
    await task();
    options?.onSuccess?.();
    await reload();
  }

  async function toggleAction(actionKey: DailyActionKey) {
    if (!profileId) return;

    const completed = await todayService.toggleAction(profileId, actionKey);

    setActionState((current) => ({
      ...current,
      [actionKey]: {
        completed,
        eventId: completed ? current[actionKey].eventId ?? 'pending' : null,
      },
    }));
    setActionFeedback({ actionKey, completed });
    await reload();

  }

  async function undoLastAction() {
    if (!profileId || !actionFeedback) return;

    await todayService.toggleAction(profileId, actionFeedback.actionKey);
    setActionFeedback(null);
    await reload();
  }

  function openSheet(nextMode: TodaySheetMode) {
    setSheetMode(nextMode);
  }

  function closeSheet() {
    setSheetMode(null);
    brushTimer.stop();
  }

  function openTimer() {
    brushTimer.open();
    openSheet('timer');
  }

  async function submitSymptom() {
    if (!profileId) return;

    await runMutation(async () => {
      await todayService.addSymptom({
        profileId,
        symptomType,
        severity: symptomSeverity,
        toothNumber: symptomTooth ? Number(symptomTooth) : null,
        notes: symptomNote || null,
      });
    }, {
      onSuccess: () => {
        setSymptomNote('');
        setSymptomTooth('');
        setSymptomSeverity(null);
        closeSheet();
      },
    });
  }

  async function submitAppointment(defaultTitle: string) {
    if (!profileId) return;

    await runMutation(async () => {
      await todayService.addAppointment({
        profileId,
        title: appointmentTitle.trim() || defaultTitle,
        doctorName: appointmentProvider.trim() || null,
        startsAt: appointmentStartsAt,
      });
    }, {
      onSuccess: () => {
        setAppointmentTitle('');
        setAppointmentProvider('');
        setAppointmentStartsAt(createDefaultAppointmentDateTime());
        closeSheet();
      },
    });
  }

  async function submitToothUpdate() {
    if (!profileId || !toothNumber.trim()) return;

    await runMutation(async () => {
      await todayService.updateTooth({
        profileId,
        toothNumber: Number(toothNumber),
        status: toothStatus,
        note: toothNote || null,
      });
    }, {
      onSuccess: () => {
        setToothNumber('');
        setToothNote('');
        closeSheet();
      },
    });
  }

  async function completeBrushTimer(completionChoice: 'morning_brush' | 'night_brush') {
    await brushTimer.confirmCompletion(completionChoice);
    closeSheet();
  }

  return {
    loading,
    error,
    quickStatus,
    insights,
    brushingFrequencyPerDay,
    reload,
    visibleActions,
    actionState,
    actionFeedback,
    sheetMode,
    openSheet,
    closeSheet,
    toggleAction,
    undoLastAction,
    symptomType,
    setSymptomType,
    symptomSeverity,
    setSymptomSeverity,
    symptomTooth,
    setSymptomTooth,
    symptomNote,
    setSymptomNote,
    appointmentTitle,
    setAppointmentTitle,
    appointmentProvider,
    setAppointmentProvider,
    appointmentStartsAt,
    setAppointmentStartsAt,
    toothNumber,
    setToothNumber,
    toothStatus,
    setToothStatus,
    toothNote,
    setToothNote,
    submitSymptom,
    submitAppointment,
    submitToothUpdate,
    timerActive: brushTimer.isRunning,
    toggleTimerRunning: brushTimer.toggleRunning,
    secondsLeft: brushTimer.secondsLeft,
    resetTimer: brushTimer.reset,
    openTimer,
    timerCompletionPromptVisible: brushTimer.completionPromptVisible,
    completeBrushTimer,
    timerProgress: brushTimer.progress,
    activeQuadrantIndex: brushTimer.activeQuadrantIndex,
    timerQuadrants: brushTimer.quadrants,
  };
}
