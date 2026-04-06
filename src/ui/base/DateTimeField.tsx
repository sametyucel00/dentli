import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { createElement, useMemo, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { useAppLocale } from '@/src/i18n/useAppLocale';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Text } from '@/src/ui/base/Text';

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

function toWebInputValue(mode: 'date' | 'time', value: Date) {
  if (mode === 'date') {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const hour = String(value.getHours()).padStart(2, '0');
  const minute = String(value.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
}

export function DateTimeField({ mode, value, label, onChange }: DateTimeFieldProps) {
  const { theme } = useAppTheme();
  const locale = useAppLocale();
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const dateValue = useMemo(() => parseIso(value), [value]);
  const displayValue = useMemo(
    () =>
      new Intl.DateTimeFormat(
        locale,
        mode === 'date'
          ? { day: '2-digit', month: 'short', year: 'numeric' }
          : { hour: '2-digit', minute: '2-digit' },
      ).format(dateValue),
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
    return (
      <View style={{ gap: theme.spacing.xs }}>
        <Text color="muted" variant="caption" weight="semibold">
          {label}
        </Text>
        {createElement('input', {
          'aria-label': label,
          onChange: (event: { target: { value: string } }) => {
            const nextValue = event.target.value;
            if (!nextValue) {
              return;
            }

            const nextDate = mode === 'date'
              ? new Date(`${nextValue}T${toWebInputValue('time', dateValue)}:00`)
              : new Date(`${toWebInputValue('date', dateValue)}T${nextValue}:00`);

            onChange(mode === 'date' ? setDatePart(value, nextDate) : setTimePart(value, nextDate));
          },
          style: {
            appearance: 'none',
            backgroundColor: theme.colors.surfaceMuted,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radii.md,
            color: theme.colors.text,
            fontSize: 16,
            minHeight: 52,
            outline: 'none',
            padding: `${theme.spacing.md}px ${theme.spacing.lg}px`,
            width: '100%',
          },
          type: mode,
          value: toWebInputValue(mode, dateValue),
        })}
      </View>
    );
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
          justifyContent: 'center',
          minHeight: 52,
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
