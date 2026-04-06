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
  'other',
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
      <OptionPills
        containerStyle={{ justifyContent: 'center' }}
        labelMap={(value) => t(`appointments.types.${value}`)}
        onSelect={(value) => onChange({ appointmentType: value })}
        options={APPOINTMENT_TYPES}
        selectedValue={draft.appointmentType}
      />
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
      {draft.endsAt ? (
        <View style={{ flexDirection: isWideLayout ? 'row' : 'column', gap: theme.spacing.md }}>
          <View style={{ flex: 1 }}>
            <DateTimeField
              label={t('appointments.form.endDate')}
              mode="date"
              onChange={(value) => onChange({ endsAt: value })}
              value={draft.endsAt}
            />
          </View>
          <View style={{ flex: 1 }}>
            <DateTimeField
              label={t('appointments.form.endTime')}
              mode="time"
              onChange={(value) => onChange({ endsAt: value })}
              value={draft.endsAt}
            />
          </View>
        </View>
      ) : (
        <Button
          onPress={() => onChange({ endsAt: draft.startsAt })}
          title={t('appointments.form.addEndTime')}
          variant="ghost"
        />
      )}
      <TextField
        onChangeText={(value) => onChange({ notes: value })}
        placeholder={t('appointments.form.notes')}
        value={draft.notes}
      />
      <OptionPills
        containerStyle={{ justifyContent: 'center' }}
        labelMap={(value) => t(`appointments.status.${value}`)}
        onSelect={(value) => onChange({ status: value })}
        options={APPOINTMENT_STATUSES}
        selectedValue={draft.status}
      />
      <Text variant="caption" color="muted">
        {t('appointments.form.reminderTitle')}
      </Text>
      <OptionPills
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
