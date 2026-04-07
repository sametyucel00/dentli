import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Appointment } from '@/src/domain/models';
import { formatDateTime } from '@/src/features/today/formatters';
import { useAppLocale } from '@/src/i18n/useAppLocale';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Card, Text } from '@/src/ui/base';

export function AppointmentCard({
  appointment,
  onPress,
}: {
  appointment: Appointment;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const locale = useAppLocale();
  const reminderLabel =
    appointment.reminderEnabled && appointment.reminderMinutesBefore !== null
      ? appointment.reminderMinutesBefore === 180
        ? t('appointments.reminders.threeHours')
        : appointment.reminderMinutesBefore === 1440
          ? t('appointments.reminders.oneDay')
          : appointment.reminderMinutesBefore === 10080
            ? t('appointments.reminders.oneWeek')
            : t('appointments.reminderSet', { count: appointment.reminderMinutesBefore })
      : null;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.995 : 1 }],
      })}>
      <Card style={{ height: '100%', paddingVertical: theme.spacing.lg }}>
        <View style={{ gap: theme.spacing.md }}>
          <View>
            <Text weight="semibold">{appointment.title}</Text>
            <Text color="muted" style={{ marginTop: theme.spacing.xs }}>
              {formatDateTime(appointment.startsAt, locale, '')}
            </Text>
          </View>
          <View style={{ gap: theme.spacing.xs }}>
            <Text color="muted">
              {t('appointments.labels.type')}: {t(`appointments.types.${appointment.appointmentType}`)}
            </Text>
            <Text color="muted">
              {t('appointments.labels.clinic')}: {appointment.clinicName ?? t('appointments.noProvider')}
            </Text>
            <Text color="muted">
              {t('appointments.labels.doctor')}: {appointment.doctorName ?? t('appointments.noProvider')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md }}>
            <Text variant="caption" color="muted">
              {t(`appointments.status.${appointment.status}`)}
            </Text>
            {reminderLabel ? <Text color="muted" variant="caption">{reminderLabel}</Text> : null}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
