import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { useAppLocale } from '@/src/i18n/useAppLocale';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Text } from '@/src/ui/base/Text';
import { TextField } from '@/src/ui/base/TextField';

type DateTimeFieldProps = {
  mode: 'date' | 'time';
  value: string;
  label: string;
  onChange: (value: string) => void;
};

function parseIso(value: string) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function setDatePart(currentValue: string, nextDate: Date) {
  const current = parseIso(currentValue);
  const merged = new Date(current);
  merged.setFullYear(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
  return merged.toISOString();
}

function setTimePart(currentValue: string, nextTime: Date) {
  const current = parseIso(currentValue);
  const merged = new Date(current);
  merged.setHours(nextTime.getHours(), nextTime.getMinutes(), 0, 0);
  return merged.toISOString();
}

export function DateTimeField({ mode, value, label, onChange }: DateTimeFieldProps) {
  const { theme } = useAppTheme();
  const locale = useAppLocale();
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const dateValue = useMemo(() => parseIso(value), [value]);
  const displayValue = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, mode === 'date'
        ? { day: '2-digit', month: 'short', year: 'numeric' }
        : { hour: '2-digit', minute: '2-digit' }).format(dateValue),
    [dateValue, locale, mode],
  );

  function handleChange(_: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      setIsPickerVisible(false);
    }

    if (!selectedDate) {
      return;
    }

    onChange(mode === 'date' ? setDatePart(value, selectedDate) : setTimePart(value, selectedDate));
  }

  if (Platform.OS === 'web') {
    return <TextField onChangeText={onChange} placeholder={label} value={value} />;
  }

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text color="muted" variant="caption" weight="semibold">
        {label}
      </Text>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={() => setIsPickerVisible((current) => !current)}
        style={{
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.md,
          borderWidth: 1,
          minHeight: 52,
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.lg,
        }}>
        <Text>{displayValue}</Text>
      </Pressable>
      {isPickerVisible ? (
        <DateTimePicker
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          mode={mode}
          onChange={handleChange}
          value={dateValue}
        />
      ) : null}
    </View>
  );
}
