import * as Haptics from 'expo-haptics';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDraftState } from '@/src/hooks/useDraftState';
import { useFocusedAsyncEffect } from '@/src/hooks/useFocusedAsyncEffect';
import {
  INITIAL_TIMELINE_APPOINTMENT_DRAFT,
  INITIAL_TIMELINE_HYGIENE_DRAFT,
  INITIAL_TIMELINE_SYMPTOM_DRAFT,
  INITIAL_TIMELINE_TOOTH_DRAFT,
  TimelineAppointmentDraft,
  TimelineFilter,
  TimelineHygieneDraft,
  TimelineItem,
  TimelineSymptomDraft,
  TimelineToothDraft,
} from '@/src/features/timeline/model';
import { timelineService } from '@/src/features/timeline/timeline-service';

export function useTimelineScreen(profileId: string | null, isFocused: boolean) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editorBusy, setEditorBusy] = useState(false);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [filter, setFilter] = useState<TimelineFilter>('all');
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
  const [creatingSymptom, setCreatingSymptom] = useState(false);
  const {
    draft: symptomDraft,
    setDraft: setSymptomDraft,
    patchDraft: patchSymptomDraft,
    resetDraft: resetSymptomDraft,
  } = useDraftState<TimelineSymptomDraft>(() => INITIAL_TIMELINE_SYMPTOM_DRAFT);
  const {
    draft: appointmentDraft,
    setDraft: setAppointmentDraft,
    patchDraft: patchAppointmentDraft,
    resetDraft: resetAppointmentDraft,
  } = useDraftState<TimelineAppointmentDraft>(() => INITIAL_TIMELINE_APPOINTMENT_DRAFT);
  const {
    draft: hygieneDraft,
    setDraft: setHygieneDraft,
    patchDraft: patchHygieneDraft,
    resetDraft: resetHygieneDraft,
  } = useDraftState<TimelineHygieneDraft>(() => INITIAL_TIMELINE_HYGIENE_DRAFT);
  const {
    draft: toothDraft,
    setDraft: setToothDraft,
    patchDraft: patchToothDraft,
    resetDraft: resetToothDraft,
  } = useDraftState<TimelineToothDraft>(() => INITIAL_TIMELINE_TOOTH_DRAFT);

  const reload = useCallback(async () => {
    if (!profileId) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setItems(await timelineService.load(profileId));
    } catch (error) {
      setError(error instanceof Error ? error.message : t('timeline.errors.load'));
    } finally {
      setLoading(false);
    }
  }, [profileId, t]);

  useFocusedAsyncEffect(isFocused, reload);

  const visibleItems = useMemo(
    () => (filter === 'all' ? items : items.filter((item) => item.kind === filter)),
    [filter, items],
  );

  function closeEditor() {
    setSelectedItem(null);
    setCreatingSymptom(false);
    setEditorError(null);
    setEditorBusy(false);
    resetSymptomDraft();
    resetAppointmentDraft();
    resetHygieneDraft();
    resetToothDraft();
  }

  async function openItem(item: TimelineItem) {
    await Haptics.selectionAsync();
    setEditorError(null);
    setSelectedItem(item);
    setCreatingSymptom(false);

    if (item.kind === 'symptom') {
      setSymptomDraft({
        symptomType: item.event.symptomType,
        severity: item.event.severity,
        toothNumber: item.event.toothNumber?.toString() ?? '',
        notes: item.event.notes ?? '',
        occurredAt: item.event.occurredAt,
      });
    }

    if (item.kind === 'appointment') {
      setAppointmentDraft({
        title: item.event.title,
        appointmentType: item.event.appointmentType,
        clinicName: item.event.clinicName ?? '',
        doctorName: item.event.doctorName ?? '',
        startsAt: item.event.startsAt,
        status: item.event.status,
      });
    }

    if (item.kind === 'hygiene') {
      setHygieneDraft({
        occurredAt: item.event.occurredAt,
        notes: item.event.notes ?? '',
      });
    }

    if (item.kind === 'tooth') {
      setToothDraft({
        status: item.event.status,
        note: item.event.note ?? '',
        recordedAt: item.event.recordedAt,
      });
    }
  }

  async function openNewSymptom() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditorError(null);
    setCreatingSymptom(true);
    setSelectedItem(null);
    setSymptomDraft({
      ...INITIAL_TIMELINE_SYMPTOM_DRAFT,
      occurredAt: new Date().toISOString(),
    });
  }

  async function runMutation(task: () => Promise<void>) {
    setEditorBusy(true);
    setEditorError(null);

    try {
      await task();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      closeEditor();
      await reload();
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : t('timeline.errors.save'));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setEditorBusy(false);
    }
  }

  async function saveEditor() {
    if (!selectedItem) return;

    if (selectedItem.kind === 'symptom') {
      await runMutation(() =>
        timelineService.updateSymptom({
          ...selectedItem.event,
          symptomType: symptomDraft.symptomType,
          severity: symptomDraft.severity,
          toothNumber: symptomDraft.toothNumber ? Number(symptomDraft.toothNumber) : null,
          notes: symptomDraft.notes.trim() || null,
          occurredAt: symptomDraft.occurredAt,
        }),
      );
      return;
    }

    if (selectedItem.kind === 'appointment') {
      if (!appointmentDraft.title.trim()) {
        setEditorError(t('timeline.errors.appointmentTitleRequired'));
        return;
      }

      await runMutation(() =>
        timelineService.updateAppointment({
          ...selectedItem.event,
          title: appointmentDraft.title.trim() || selectedItem.event.title,
          appointmentType: appointmentDraft.appointmentType,
          clinicName: appointmentDraft.clinicName.trim() || null,
          doctorName: appointmentDraft.doctorName.trim() || null,
          startsAt: appointmentDraft.startsAt,
          status: appointmentDraft.status,
        }),
      );
      return;
    }

    if (selectedItem.kind === 'hygiene') {
      await runMutation(() =>
        timelineService.updateHygieneEvent({
          ...selectedItem.event,
          occurredAt: hygieneDraft.occurredAt,
          notes: hygieneDraft.notes.trim() || null,
        }),
      );
      return;
    }

    await runMutation(() =>
      timelineService.updateToothUpdate({
        ...selectedItem.event,
        status: toothDraft.status,
        note: toothDraft.note.trim() || null,
        recordedAt: toothDraft.recordedAt,
      }),
    );
  }

  async function deleteSelectedItem() {
    if (!selectedItem) return;

    if (selectedItem.kind === 'symptom') {
      await runMutation(() => timelineService.deleteSymptom(selectedItem.event.id));
      return;
    }

    if (selectedItem.kind === 'appointment') {
      await runMutation(() => timelineService.deleteAppointment(selectedItem.event.id));
      return;
    }

    if (selectedItem.kind === 'hygiene') {
      await runMutation(() => timelineService.deleteHygieneEvent(selectedItem.event.id));
      return;
    }

    await runMutation(() => timelineService.deleteToothUpdate(selectedItem.event));
  }

  async function createSymptom() {
    if (!profileId) return;

    setEditorError(null);
    await runMutation(() =>
      timelineService.createSymptom({
        profileId,
        symptomType: symptomDraft.symptomType,
        severity: symptomDraft.severity,
        toothNumber: symptomDraft.toothNumber ? Number(symptomDraft.toothNumber) : null,
        notes: symptomDraft.notes.trim() || null,
        occurredAt: symptomDraft.occurredAt,
      }),
    );
  }

  return {
    loading,
    error,
    filter,
    setFilter,
    visibleItems,
    reload,
    selectedItem,
    creatingSymptom,
    editorBusy,
    editorError,
    openItem,
    openNewSymptom,
    closeEditor,
    saveEditor,
    deleteSelectedItem,
    createSymptom,
    symptomDraft,
    appointmentDraft,
    hygieneDraft,
    toothDraft,
    setSymptomDraft: patchSymptomDraft,
    setAppointmentDraft: patchAppointmentDraft,
    setHygieneDraft: patchHygieneDraft,
    setToothDraft: patchToothDraft,
  };
}
