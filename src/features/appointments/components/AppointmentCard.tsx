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

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.995 : 1 }],
      })}>
      <Card style={{ paddingVertical: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text weight="semibold">{appointment.title}</Text>
            <Text color="muted" style={{ marginTop: theme.spacing.xs }}>
              {t('appointments.labels.type')}: {t(`appointments.types.${appointment.appointmentType}`)}
            </Text>
            {appointment.clinicName ? (
              <Text color="muted" style={{ marginTop: theme.spacing.xs }}>
                {t('appointments.labels.clinic')}: {appointment.clinicName}
              </Text>
            ) : null}
            {appointment.doctorName ? (
              <Text color="muted" style={{ marginTop: theme.spacing.xs }}>
                {t('appointments.labels.doctor')}: {appointment.doctorName}
              </Text>
            ) : null}
          </View>
          <View style={{ alignItems: 'flex-end', maxWidth: 120 }}>
            <Text variant="caption" color="muted" style={{ textAlign: 'right' }}>
              {formatDateTime(appointment.startsAt, locale, '')}
            </Text>
            <Text style={{ marginTop: theme.spacing.xs }} variant="caption" weight="semibold">
              {t(`appointments.status.${appointment.status}`)}
            </Text>
            {appointment.reminderEnabled && appointment.reminderMinutesBefore !== null ? (
              <Text color="muted" style={{ marginTop: theme.spacing.xs }} variant="caption">
                {t('appointments.reminderSet', { count: appointment.reminderMinutesBefore })}
              </Text>
            ) : null}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
