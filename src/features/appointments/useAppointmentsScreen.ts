import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Appointment } from '@/src/domain/models';
import { useDraftState } from '@/src/hooks/useDraftState';
import { useFocusedAsyncEffect } from '@/src/hooks/useFocusedAsyncEffect';
import {
  AppointmentDraft,
  createInitialAppointmentDraft,
  mapDraftToAppointmentInput,
} from '@/src/features/appointments/model';
import { appointmentService } from '@/src/services';
import { useAppStore } from '@/src/state/useAppStore';

export function useAppointmentsScreen() {
  const isFocused = useIsFocused();
  const selectedProfileId = useAppStore((state) => state.selectedProfileId);
  const cachedAppointments = useAppStore((state) =>
    selectedProfileId ? state.cache.appointmentsByProfileId[selectedProfileId]?.data ?? [] : [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(cachedAppointments);
  const [isCreateSheetVisible, setIsCreateSheetVisible] = useState(false);
  const {
    draft: appointmentDraft,
    patchDraft: patchAppointmentDraft,
    resetDraft: resetAppointmentDraft,
  } = useDraftState<AppointmentDraft>(createInitialAppointmentDraft);

  const reload = useCallback(async () => {
    if (!selectedProfileId) {
      setAppointments([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setAppointments(await appointmentService.listByProfileId(selectedProfileId));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load appointments.');
    } finally {
      setLoading(false);
    }
  }, [selectedProfileId]);

  useEffect(() => {
    setAppointments(cachedAppointments);
  }, [cachedAppointments]);

  useFocusedAsyncEffect(isFocused, reload);

  const upcomingCount = useMemo(
    () => appointments.filter((item) => item.status === 'scheduled').length,
    [appointments],
  );

  function openCreateSheet() {
    resetAppointmentDraft();
    setIsCreateSheetVisible(true);
  }

  function closeCreateSheet() {
    setIsCreateSheetVisible(false);
    resetAppointmentDraft();
  }

  async function createAppointment() {
    if (!selectedProfileId || !appointmentDraft.title.trim()) return;

    await appointmentService.create(
      mapDraftToAppointmentInput(selectedProfileId, appointmentDraft),
    );

    closeCreateSheet();
    await reload();
  }

  return {
    loading,
    error,
    appointments,
    upcomingCount,
    reload,
    appointmentDraft,
    isCreateSheetVisible,
    openCreateSheet,
    closeCreateSheet,
    patchAppointmentDraft,
    createAppointment,
  };
}
