import { useEffect, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SYMPTOM_SEVERITY_OPTIONS, SYMPTOM_TYPE_OPTIONS } from '@/src/domain/symptoms';
import { TOOTH_STATUS_OPTIONS } from '@/src/domain/teeth';
import {
  TimelineAppointmentDraft,
  TimelineHygieneDraft,
  TimelineItem,
  TimelineSymptomDraft,
  TimelineToothDraft,
} from '@/src/features/timeline/model';
import { getHygieneActionLabel } from '@/src/features/timeline/presentation';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { BottomSheetModal, Button, DateTimeField, OptionPills, Text, TextField } from '@/src/ui/base';

export type TimelineEditorSheetProps = {
  visible: boolean;
  item: TimelineItem | null;
  symptomDraft: TimelineSymptomDraft;
  appointmentDraft: TimelineAppointmentDraft;
  hygieneDraft: TimelineHygieneDraft;
  toothDraft: TimelineToothDraft;
  onClose: () => void;
  onDelete: () => void;
  onSave: () => void;
  onCreateSymptom: () => void;
  onChangeSymptomDraft: (patch: Partial<TimelineSymptomDraft>) => void;
  onChangeAppointmentDraft: (patch: Partial<TimelineAppointmentDraft>) => void;
  onChangeHygieneDraft: (patch: Partial<TimelineHygieneDraft>) => void;
  onChangeToothDraft: (patch: Partial<TimelineToothDraft>) => void;
  busy: boolean;
  error: string | null;
};

const APPOINTMENT_STATUSES: TimelineAppointmentDraft['status'][] = [
  'scheduled',
  'completed',
  'cancelled',
];
const APPOINTMENT_TYPES: TimelineAppointmentDraft['appointmentType'][] = [
  'checkup',
  'cleaning',
  'consultation',
  'treatment',
];

export function TimelineEditorSheet({
  visible,
  item,
  symptomDraft,
  appointmentDraft,
  hygieneDraft,
  toothDraft,
  onClose,
  onDelete,
  onSave,
  onCreateSymptom,
  onChangeSymptomDraft,
  onChangeAppointmentDraft,
  onChangeHygieneDraft,
  onChangeToothDraft,
  busy,
  error,
}: TimelineEditorSheetProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const isVeryNarrow = width < 350;
  const singleActionStyle = {
    alignSelf: 'center',
    maxWidth: 340,
    minWidth: isVeryNarrow ? 0 : 220,
    width: isVeryNarrow ? '100%' : '72%',
  } as const;
  const splitActionStyle = { flexBasis: isVeryNarrow ? '100%' : '48%', minWidth: 0 } as const;
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  useEffect(() => {
    if (item === null) {
      setDetailsOpen(false);
      setNotesOpen(Boolean(symptomDraft.notes));
      return;
    }

    if (item.kind === 'appointment') {
      setDetailsOpen(
        Boolean(
          appointmentDraft.clinicName ||
            appointmentDraft.doctorName ||
            appointmentDraft.status !== 'scheduled',
        ),
      );
      setNotesOpen(false);
      return;
    }

    if (item.kind === 'hygiene') {
      setDetailsOpen(false);
      setNotesOpen(Boolean(hygieneDraft.notes));
      return;
    }

    if (item.kind === 'tooth') {
      setDetailsOpen(false);
      setNotesOpen(Boolean(toothDraft.note));
      return;
    }

    setDetailsOpen(false);
    setNotesOpen(Boolean(symptomDraft.notes));
  }, [
    item,
    appointmentDraft.clinicName,
    appointmentDraft.doctorName,
    appointmentDraft.status,
    hygieneDraft.notes,
    symptomDraft.notes,
    toothDraft.note,
  ]);

  return (
    <BottomSheetModal minHeight={420} onClose={onClose} visible={visible}>
      <View style={{ gap: theme.spacing.md }}>
        {error ? <Text style={{ color: theme.colors.danger }}>{error}</Text> : null}
        {item === null ? (
          <>
            <Text variant="title" weight="semibold">
              {t('timeline.newSymptom.title')}
            </Text>
            <Text variant="caption" color="muted" weight="semibold">
              {t('today.sheet.symptomCategory')}
            </Text>
            <OptionPills
              columns={2}
              containerStyle={{ justifyContent: 'center' }}
              labelMap={(value) => t(`timeline.symptoms.${value}`)}
              onSelect={(value) => onChangeSymptomDraft({ symptomType: value })}
              options={SYMPTOM_TYPE_OPTIONS}
              selectedValue={symptomDraft.symptomType}
            />
            <Text variant="caption" color="muted" weight="semibold">
              {t('today.sheet.symptomSeverity')}
            </Text>
            <OptionPills
              columns={2}
              containerStyle={{ justifyContent: 'center' }}
              labelMap={(value) =>
                value === null ? t('timeline.newSymptom.noSeverity') : t(`today.sheet.severity.${value}`)
              }
              onSelect={(value) => onChangeSymptomDraft({ severity: value })}
              options={SYMPTOM_SEVERITY_OPTIONS}
              selectedValue={symptomDraft.severity}
            />
            <TextField
              keyboardType="number-pad"
              onChangeText={(value) => onChangeSymptomDraft({ toothNumber: value })}
              placeholder={t('timeline.newSymptom.toothPlaceholder')}
              value={symptomDraft.toothNumber}
            />
            <Button
              onPress={() => setNotesOpen((current) => !current)}
              title={t(notesOpen ? 'common.hideNotes' : 'common.showNotes')}
              variant="ghost"
            />
            {notesOpen ? (
              <TextField
                multiline
                numberOfLines={4}
                onChangeText={(value) => onChangeSymptomDraft({ notes: value })}
                placeholder={t('timeline.newSymptom.notePlaceholder')}
                value={symptomDraft.notes}
              />
            ) : null}
            <View style={{ gap: theme.spacing.md }}>
              <DateTimeField
                label={t('timeline.common.date')}
                mode="date"
                onChange={(value) => onChangeSymptomDraft({ occurredAt: value })}
                value={symptomDraft.occurredAt}
              />
              <DateTimeField
                label={t('timeline.common.time')}
                mode="time"
                onChange={(value) => onChangeSymptomDraft({ occurredAt: value })}
                value={symptomDraft.occurredAt}
              />
            </View>
            <Button
              disabled={busy}
              onPress={onCreateSymptom}
              style={singleActionStyle}
              title={busy ? t('timeline.common.saving') : t('timeline.newSymptom.save')}
            />
          </>
        ) : item.kind === 'symptom' ? (
          <>
            <Text variant="title" weight="semibold">
              {t('timeline.editSymptom.title')}
            </Text>
            <Text variant="caption" color="muted" weight="semibold">
              {t('today.sheet.symptomCategory')}
            </Text>
            <OptionPills
              columns={2}
              containerStyle={{ justifyContent: 'center' }}
              labelMap={(value) => t(`timeline.symptoms.${value}`)}
              onSelect={(value) => onChangeSymptomDraft({ symptomType: value })}
              options={SYMPTOM_TYPE_OPTIONS}
              selectedValue={symptomDraft.symptomType}
            />
            <Text variant="caption" color="muted" weight="semibold">
              {t('today.sheet.symptomSeverity')}
            </Text>
            <OptionPills
              columns={2}
              containerStyle={{ justifyContent: 'center' }}
              labelMap={(value) =>
                value === null ? t('timeline.newSymptom.noSeverity') : t(`today.sheet.severity.${value}`)
              }
              onSelect={(value) => onChangeSymptomDraft({ severity: value })}
              options={SYMPTOM_SEVERITY_OPTIONS}
              selectedValue={symptomDraft.severity}
            />
            <TextField
              keyboardType="number-pad"
              onChangeText={(value) => onChangeSymptomDraft({ toothNumber: value })}
              placeholder={t('timeline.newSymptom.toothPlaceholder')}
              value={symptomDraft.toothNumber}
            />
            <Button
              onPress={() => setNotesOpen((current) => !current)}
              title={t(notesOpen ? 'common.hideNotes' : 'common.showNotes')}
              variant="ghost"
            />
            {notesOpen ? (
              <TextField
                onChangeText={(value) => onChangeSymptomDraft({ notes: value })}
                placeholder={t('timeline.newSymptom.notePlaceholder')}
                value={symptomDraft.notes}
              />
            ) : null}
            <View style={{ gap: theme.spacing.md }}>
              <DateTimeField
                label={t('timeline.common.date')}
                mode="date"
                onChange={(value) => onChangeSymptomDraft({ occurredAt: value })}
                value={symptomDraft.occurredAt}
              />
              <DateTimeField
                label={t('timeline.common.time')}
                mode="time"
                onChange={(value) => onChangeSymptomDraft({ occurredAt: value })}
                value={symptomDraft.occurredAt}
              />
            </View>
            <View
              style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, justifyContent: 'center' }}>
              <Button
                disabled={busy}
                onPress={onSave}
                style={splitActionStyle}
                title={busy ? t('timeline.common.saving') : t('timeline.common.save')}
              />
              <Button
                disabled={busy}
                onPress={onDelete}
                style={splitActionStyle}
                title={t('timeline.common.delete')}
                variant="ghost"
              />
            </View>
          </>
        ) : item.kind === 'appointment' ? (
          <>
            <Text variant="title" weight="semibold">
              {t('timeline.editAppointment.title')}
            </Text>
            <TextField
              onChangeText={(value) => onChangeAppointmentDraft({ title: value })}
              placeholder={t('timeline.editAppointment.titlePlaceholder')}
              value={appointmentDraft.title}
            />
            <OptionPills
              columns={2}
              containerStyle={{ justifyContent: 'center' }}
              labelMap={(value) => t(`appointments.types.${value}`)}
              onSelect={(value) => onChangeAppointmentDraft({ appointmentType: value })}
              options={APPOINTMENT_TYPES}
              selectedValue={appointmentDraft.appointmentType}
            />
            <View style={{ gap: theme.spacing.md }}>
              <DateTimeField
                label={t('timeline.common.date')}
                mode="date"
                onChange={(value) => onChangeAppointmentDraft({ startsAt: value })}
                value={appointmentDraft.startsAt}
              />
              <DateTimeField
                label={t('timeline.common.time')}
                mode="time"
                onChange={(value) => onChangeAppointmentDraft({ startsAt: value })}
                value={appointmentDraft.startsAt}
              />
            </View>
            <Button
              onPress={() => setDetailsOpen((current) => !current)}
              title={t(detailsOpen ? 'common.hideOptionalDetails' : 'common.optionalDetails')}
              variant="ghost"
            />
            {detailsOpen ? (
              <View style={{ gap: theme.spacing.md }}>
                <TextField
                  onChangeText={(value) => onChangeAppointmentDraft({ clinicName: value })}
                  placeholder={t('timeline.editAppointment.clinicPlaceholder')}
                  value={appointmentDraft.clinicName}
                />
                <TextField
                  onChangeText={(value) => onChangeAppointmentDraft({ doctorName: value })}
                  placeholder={t('timeline.editAppointment.doctorPlaceholder')}
                  value={appointmentDraft.doctorName}
                />
                <OptionPills
                  columns={3}
                  containerStyle={{ justifyContent: 'center' }}
                  labelMap={(value) => t(`timeline.appointmentStatus.${value}`)}
                  onSelect={(value) => onChangeAppointmentDraft({ status: value })}
                  options={APPOINTMENT_STATUSES}
                  selectedValue={appointmentDraft.status}
                />
              </View>
            ) : null}
            <View
              style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, justifyContent: 'center' }}>
              <Button
                disabled={busy}
                onPress={onSave}
                style={splitActionStyle}
                title={busy ? t('timeline.common.saving') : t('timeline.common.save')}
              />
              <Button
                disabled={busy}
                onPress={onDelete}
                style={splitActionStyle}
                title={t('timeline.common.delete')}
                variant="ghost"
              />
            </View>
          </>
        ) : item.kind === 'hygiene' ? (
          <>
            <Text variant="title" weight="semibold">
              {t('timeline.editHygiene.title')}
            </Text>
            <Text color="muted">
              {getHygieneActionLabel(item.event.actionKey, item.event.eventType, t)}
            </Text>
            <View style={{ gap: theme.spacing.md }}>
              <DateTimeField
                label={t('timeline.common.date')}
                mode="date"
                onChange={(value) => onChangeHygieneDraft({ occurredAt: value })}
                value={hygieneDraft.occurredAt}
              />
              <DateTimeField
                label={t('timeline.common.time')}
                mode="time"
                onChange={(value) => onChangeHygieneDraft({ occurredAt: value })}
                value={hygieneDraft.occurredAt}
              />
            </View>
            <Button
              onPress={() => setNotesOpen((current) => !current)}
              title={t(notesOpen ? 'common.hideNotes' : 'common.showNotes')}
              variant="ghost"
            />
            {notesOpen ? (
              <TextField
                multiline
                numberOfLines={4}
                onChangeText={(value) => onChangeHygieneDraft({ notes: value })}
                placeholder={t('timeline.newSymptom.notePlaceholder')}
                value={hygieneDraft.notes}
              />
            ) : null}
            <View
              style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, justifyContent: 'center' }}>
              <Button
                disabled={busy}
                onPress={onSave}
                style={splitActionStyle}
                title={busy ? t('timeline.common.saving') : t('timeline.common.save')}
              />
              <Button
                disabled={busy}
                onPress={onDelete}
                style={splitActionStyle}
                title={t('timeline.common.delete')}
                variant="ghost"
              />
            </View>
          </>
        ) : (
          <>
            <Text variant="title" weight="semibold">
              {t('timeline.editTooth.title', { toothNumber: item.event.toothNumber })}
            </Text>
            <OptionPills
              columns={3}
              containerStyle={{ justifyContent: 'center' }}
              labelMap={(value) => t(`toothMap.status.${value}`)}
              onSelect={(value) => onChangeToothDraft({ status: value })}
              options={TOOTH_STATUS_OPTIONS}
              selectedValue={toothDraft.status}
            />
            <Button
              onPress={() => setNotesOpen((current) => !current)}
              title={t(notesOpen ? 'common.hideNotes' : 'common.showNotes')}
              variant="ghost"
            />
            {notesOpen ? (
              <TextField
                multiline
                numberOfLines={4}
                onChangeText={(value) => onChangeToothDraft({ note: value })}
                placeholder={t('timeline.newSymptom.notePlaceholder')}
                value={toothDraft.note}
              />
            ) : null}
            <View style={{ gap: theme.spacing.md }}>
              <DateTimeField
                label={t('timeline.common.date')}
                mode="date"
                onChange={(value) => onChangeToothDraft({ recordedAt: value })}
                value={toothDraft.recordedAt}
              />
              <DateTimeField
                label={t('timeline.common.time')}
                mode="time"
                onChange={(value) => onChangeToothDraft({ recordedAt: value })}
                value={toothDraft.recordedAt}
              />
            </View>
            <View
              style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, justifyContent: 'center' }}>
              <Button
                disabled={busy}
                onPress={onSave}
                style={splitActionStyle}
                title={busy ? t('timeline.common.saving') : t('timeline.common.save')}
              />
              <Button
                disabled={busy}
                onPress={onDelete}
                style={splitActionStyle}
                title={t('timeline.common.delete')}
                variant="ghost"
              />
            </View>
          </>
        )}
      </View>
    </BottomSheetModal>
  );
}
