import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppointmentDraft, APPOINTMENT_REMINDER_OPTIONS } from '@/src/features/appointments/model';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Button, OptionPills, Text, TextField } from '@/src/ui/base';

const APPOINTMENT_STATUSES: AppointmentDraft['status'][] = [
  'scheduled',
  'completed',
  'cancelled',
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
      <TextField
        onChangeText={(value) => onChange({ providerName: value })}
        placeholder={t('appointments.form.provider')}
        value={draft.providerName}
      />
      <TextField
        onChangeText={(value) => onChange({ startsAt: value })}
        placeholder={t('appointments.form.startsAt')}
        value={draft.startsAt}
      />
      <TextField
        onChangeText={(value) => onChange({ endsAt: value })}
        placeholder={t('appointments.form.endsAt')}
        value={draft.endsAt}
      />
      <TextField
        onChangeText={(value) => onChange({ location: value })}
        placeholder={t('appointments.form.location')}
        value={draft.location}
      />
      <TextField
        onChangeText={(value) => onChange({ notes: value })}
        placeholder={t('appointments.form.notes')}
        value={draft.notes}
      />
      <OptionPills
        labelMap={(value) => t(`appointments.status.${value}`)}
        onSelect={(value) => onChange({ status: value })}
        options={APPOINTMENT_STATUSES}
        selectedValue={draft.status}
      />
      <Text variant="caption" color="muted">
        {t('appointments.form.reminderTitle')}
      </Text>
      <OptionPills
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
      <Button disabled={!draft.title.trim()} onPress={onSubmit} title={submitLabel} />
      {onDelete ? (
        <Button onPress={onDelete} title={t('appointments.form.delete')} variant="ghost" />
      ) : null}
    </View>
  );
}
