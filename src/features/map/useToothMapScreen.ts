import { useCallback, useEffect, useMemo, useState } from 'react';

import { ToothCurrentStatus, ToothStatus, ToothStatusHistory } from '@/src/domain/models';
import { useFocusedAsyncEffect } from '@/src/hooks/useFocusedAsyncEffect';
import { toothMapService } from '@/src/features/map/map-service';
import { createToothMapItems, ToothMapItem } from '@/src/features/map/map-model';
import { useAppStore } from '@/src/state/useAppStore';

const INITIAL_HISTORY: ToothStatusHistory[] = [];
const EMPTY_TOOTH_STATUSES: ToothCurrentStatus[] = [];

export function useToothMapScreen(profileId: string | null, isFocused: boolean) {
  const cachedCurrentStatuses = useAppStore((state) =>
    profileId
      ? state.cache.toothCurrentStatusByProfileId[profileId]?.data ?? EMPTY_TOOTH_STATUSES
      : EMPTY_TOOTH_STATUSES,
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
  const [editorBusy, setEditorBusy] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);

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
  const trackedTeethCount = useMemo(
    () => teeth.filter((tooth) => tooth.recordedAt !== null).length,
    [teeth],
  );

  async function openTooth(toothNumber: number) {
    if (!profileId) return;

    const tooth = teeth.find((item) => item.toothNumber === toothNumber);
    if (!tooth) return;

    setEditorError(null);
    setSelectedToothNumber(toothNumber);
    setDraftStatus(tooth.status);
    setDraftNote(tooth.note ?? '');
    try {
      setHistory(await toothMapService.loadToothHistory(profileId, toothNumber));
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : 'Unable to load tooth history.');
      setHistory(INITIAL_HISTORY);
    }
  }

  function closeEditor() {
    setSelectedToothNumber(null);
    setHistory(INITIAL_HISTORY);
    setDraftStatus('healthy');
    setDraftNote('');
    setEditorBusy(false);
    setEditorError(null);
  }

  async function saveTooth() {
    if (!profileId || selectedToothNumber === null) return;

    setEditorBusy(true);
    setEditorError(null);

    try {
      const data = await toothMapService.saveTooth({
        profileId,
        toothNumber: selectedToothNumber,
        status: draftStatus,
        note: draftNote.trim() || null,
      });

      setTeeth(data.teeth);
      setHistory(data.history);
      closeEditor();
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : 'Unable to save this tooth.');
    } finally {
      setEditorBusy(false);
    }
  }

  return {
    loading,
    error,
    teeth,
    reload,
    problemZoneCount,
    trackedTeethCount,
    selectedTooth,
    selectedToothNumber,
    history,
    draftStatus,
    setDraftStatus,
    draftNote,
    setDraftNote,
    editorBusy,
    editorError,
    openTooth,
    closeEditor,
    saveTooth,
  };
}
