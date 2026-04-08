import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, useWindowDimensions } from 'react-native';

import { AppointmentDraft, APPOINTMENT_REMINDER_OPTIONS } from '@/src/features/appointments/model';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Button, DateTimeField, OptionPills, Text, TextField } from '@/src/ui/base';

const APPOINTMENT_STATUSES: AppointmentDraft['status'][] = [
  'scheduled',
  'completed',
  'cancelled',
];
const APPOINTMENT_TYPES: AppointmentDraft['appointmentType'][] = [
  'checkup',
  'cleaning',
  'consultation',
  'treatment',
];

export function AppointmentForm({
  draft,
  title,
  submitLabel,
  onChange,
  onSubmit,
  onDelete,
}: {
  draft: AppointmentDraft;
  title: string;
  submitLabel: string;
  onChange: (patch: Partial<AppointmentDraft>) => void;
  onSubmit: () => void;
  onDelete?: () => void;
}) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const isVeryNarrow = width < 350;
  const isWideLayout = width >= 700;
  const splitButtonStyle = { flexBasis: isVeryNarrow ? '100%' : '48%', minWidth: 0 } as const;
  const singleButtonStyle = { flexBasis: isVeryNarrow ? '100%' : '72%', maxWidth: 340, minWidth: 0 } as const;
  const [detailsOpen, setDetailsOpen] = useState(
    Boolean(draft.clinicName || draft.doctorName || draft.notes || draft.endsAt || draft.status !== 'scheduled'),
  );

  useEffect(() => {
    if (draft.clinicName || draft.doctorName || draft.notes || draft.endsAt || draft.status !== 'scheduled') {
      setDetailsOpen(true);
    }
  }, [draft.clinicName, draft.doctorName, draft.notes, draft.endsAt, draft.status]);

  return (
    <View style={{ gap: theme.spacing.md }}>
      <Text variant="title" weight="semibold">
        {title}
      </Text>
      <TextField
        onChangeText={(value) => onChange({ title: value })}
        placeholder={t('appointments.form.title')}
        value={draft.title}
      />
      <Text variant="caption" color="muted" weight="semibold">
        {t('appointments.labels.type')}
      </Text>
      <OptionPills
        columns={2}
        containerStyle={{ justifyContent: 'center' }}
        labelMap={(value) => t(`appointments.types.${value}`)}
        onSelect={(value) => onChange({ appointmentType: value })}
        options={APPOINTMENT_TYPES}
        selectedValue={draft.appointmentType}
      />
      <View style={{ flexDirection: isWideLayout ? 'row' : 'column', gap: theme.spacing.md }}>
        <View style={{ flex: 1 }}>
          <DateTimeField
            label={t('appointments.form.startDate')}
            mode="date"
            onChange={(value) => onChange({ startsAt: value })}
            value={draft.startsAt}
          />
        </View>
        <View style={{ flex: 1 }}>
          <DateTimeField
            label={t('appointments.form.startTime')}
            mode="time"
            onChange={(value) => onChange({ startsAt: value })}
            value={draft.startsAt}
          />
        </View>
      </View>
      <Button
        onPress={() => setDetailsOpen((current) => !current)}
        title={t(detailsOpen ? 'common.hideOptionalDetails' : 'common.optionalDetails')}
        variant="ghost"
      />
      {detailsOpen ? (
        <View style={{ gap: theme.spacing.md }}>
          <View style={{ flexDirection: isWideLayout ? 'row' : 'column', gap: theme.spacing.md }}>
            <View style={{ flex: 1 }}>
              <TextField
                onChangeText={(value) => onChange({ clinicName: value })}
                placeholder={t('appointments.form.clinic')}
                value={draft.clinicName}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextField
                onChangeText={(value) => onChange({ doctorName: value })}
                placeholder={t('appointments.form.doctor')}
                value={draft.doctorName}
              />
            </View>
          </View>
          <TextField
            multiline
            numberOfLines={4}
            onChangeText={(value) => onChange({ notes: value })}
            placeholder={t('appointments.form.notes')}
            value={draft.notes}
          />
          <Text variant="caption" color="muted" weight="semibold">
            {t('appointments.form.statusLabel')}
          </Text>
          <OptionPills
            columns={3}
            containerStyle={{ justifyContent: 'center' }}
            labelMap={(value) => t(`appointments.status.${value}`)}
            onSelect={(value) => onChange({ status: value })}
            options={APPOINTMENT_STATUSES}
            selectedValue={draft.status}
          />
        </View>
      ) : null}
      <Text variant="caption" color="muted">
        {t('appointments.form.reminderTitle')}
      </Text>
      <OptionPills
        columns={3}
        containerStyle={{ justifyContent: 'center' }}
        labelMap={(value) =>
          t(
            APPOINTMENT_REMINDER_OPTIONS.find((option) => option.value === value)?.labelKey ??
              'appointments.reminders.none',
          )
        }
        onSelect={(value) => onChange({ reminderMinutesBefore: value })}
        options={APPOINTMENT_REMINDER_OPTIONS.map((option) => option.value)}
        selectedValue={draft.reminderMinutesBefore}
      />
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
          justifyContent: 'center',
        }}>
        <Button
          disabled={!draft.title.trim()}
          onPress={onSubmit}
          style={onDelete ? splitButtonStyle : singleButtonStyle}
          title={submitLabel}
        />
        {onDelete ? (
          <Button
            onPress={onDelete}
            style={splitButtonStyle}
            title={t('appointments.form.delete')}
            variant="ghost"
          />
        ) : null}
      </View>
    </View>
  );
}
