import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ToothStatus, ToothStatusHistory } from '@/src/domain/models';
import { useFocusedAsyncEffect } from '@/src/hooks/useFocusedAsyncEffect';
import { toothMapService } from '@/src/features/map/map-service';
import { createToothMapItems, ToothMapItem } from '@/src/features/map/map-model';
import { useAppStore } from '@/src/state/useAppStore';

const INITIAL_HISTORY: ToothStatusHistory[] = [];

export function useToothMapScreen(profileId: string | null, isFocused: boolean) {
  const cachedCurrentStatuses = useAppStore((state) =>
    profileId ? state.cache.toothCurrentStatusByProfileId[profileId]?.data ?? [] : [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teeth, setTeeth] = useState<ToothMapItem[]>(() =>
    profileId ? createToothMapItems(cachedCurrentStatuses) : [],
  );
  const [selectedToothNumber, setSelectedToothNumber] = useState<number | null>(null);
  const [history, setHistory] = useState<ToothStatusHistory[]>(INITIAL_HISTORY);
  const [draftStatus, setDraftStatus] = useState<ToothStatus>('healthy');
  const [draftNote, setDraftNote] = useState('');

  const reload = useCallback(async () => {
    if (!profileId) {
      setTeeth([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await toothMapService.load(profileId);
      setTeeth(data.teeth);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load tooth map.');
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useFocusedAsyncEffect(isFocused, reload);

  useEffect(() => {
    setTeeth(profileId ? createToothMapItems(cachedCurrentStatuses) : []);
  }, [cachedCurrentStatuses, profileId]);

  const selectedTooth =
    selectedToothNumber === null
      ? null
      : teeth.find((tooth) => tooth.toothNumber === selectedToothNumber) ?? null;

  const problemZoneCount = useMemo(
    () => teeth.filter((tooth) => tooth.isProblemZone).length,
    [teeth],
  );

  async function openTooth(toothNumber: number) {
    if (!profileId) return;

    const tooth = teeth.find((item) => item.toothNumber === toothNumber);
    if (!tooth) return;

    await Haptics.selectionAsync();
    setSelectedToothNumber(toothNumber);
    setDraftStatus(tooth.status);
    setDraftNote(tooth.note ?? '');
    setHistory(await toothMapService.loadToothHistory(profileId, toothNumber));
  }

  function closeEditor() {
    setSelectedToothNumber(null);
    setHistory(INITIAL_HISTORY);
    setDraftStatus('healthy');
    setDraftNote('');
  }

  async function saveTooth() {
    if (!profileId || selectedToothNumber === null) return;

    const data = await toothMapService.saveTooth({
      profileId,
      toothNumber: selectedToothNumber,
      status: draftStatus,
      note: draftNote.trim() || null,
    });

    setTeeth(data.teeth);
    setHistory(data.history);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    closeEditor();
  }

  return {
    loading,
    error,
    teeth,
    reload,
    problemZoneCount,
    selectedTooth,
    selectedToothNumber,
    history,
    draftStatus,
    setDraftStatus,
    draftNote,
    setDraftNote,
    openTooth,
    closeEditor,
    saveTooth,
  };
}
