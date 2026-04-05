import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CareItem } from '@/src/domain/models';
import { useDraftState } from '@/src/hooks/useDraftState';
import { useFocusedAsyncEffect } from '@/src/hooks/useFocusedAsyncEffect';
import {
  CareItemDraft,
  createInitialCareItemDraft,
  getCareCountdown,
  mapCareItemToDraft,
  mapDraftToCareItemInput,
} from '@/src/features/care/model';
import { careService } from '@/src/services';
import { useAppStore } from '@/src/state/useAppStore';

export function useCareScreen() {
  const isFocused = useIsFocused();
  const selectedProfileId = useAppStore((state) => state.selectedProfileId);
  const cachedCareItems = useAppStore((state) =>
    selectedProfileId ? state.cache.careItemsByProfileId[selectedProfileId]?.data ?? [] : [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [careItems, setCareItems] = useState<CareItem[]>(cachedCareItems);
  const [editingItem, setEditingItem] = useState<CareItem | null>(null);
  const {
    draft: careItemDraft,
    setDraft: setCareItemDraft,
    patchDraft: patchCareItemDraft,
    resetDraft: resetCareItemDraft,
  } = useDraftState<CareItemDraft>(createInitialCareItemDraft);
  const [isEditorVisible, setIsEditorVisible] = useState(false);

  const reload = useCallback(async () => {
    if (!selectedProfileId) {
      setCareItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setCareItems(await careService.listByProfileId(selectedProfileId));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load care items.');
    } finally {
      setLoading(false);
    }
  }, [selectedProfileId]);

  useEffect(() => {
    setCareItems(cachedCareItems);
  }, [cachedCareItems]);

  useFocusedAsyncEffect(isFocused, reload);

  const dueSoonCount = useMemo(
    () =>
      careItems.filter((item) => {
        const countdown = getCareCountdown(item);
        return countdown.daysLeft !== null && countdown.daysLeft <= 7;
      }).length,
    [careItems],
  );

  function resetEditor() {
    setEditingItem(null);
    resetCareItemDraft();
  }

  function openCreateEditor() {
    resetEditor();
    setIsEditorVisible(true);
  }

  function openEditEditor(item: CareItem) {
    setEditingItem(item);
    setCareItemDraft(mapCareItemToDraft(item));
    setIsEditorVisible(true);
  }

  function closeEditor() {
    setIsEditorVisible(false);
    resetEditor();
  }

  async function saveCareItem() {
    if (!selectedProfileId || !careItemDraft.title.trim()) return;

    const input = mapDraftToCareItemInput(selectedProfileId, careItemDraft);

    if (editingItem) {
      await careService.update(editingItem.id, input);
    } else {
      await careService.create(input);
    }

    closeEditor();
    await reload();
  }

  async function deleteCareItem() {
    if (!editingItem) return;

    await careService.delete(editingItem.id);
    closeEditor();
    await reload();
  }

  return {
    loading,
    error,
    careItems,
    dueSoonCount,
    reload,
    editingItem,
    careItemDraft,
    isEditorVisible,
    openCreateEditor,
    openEditEditor,
    closeEditor,
    patchCareItemDraft,
    saveCareItem,
    deleteCareItem,
  };
}
