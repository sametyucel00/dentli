import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { createElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Platform, Pressable, View } from 'react-native';

import { useAppLocale } from '@/src/i18n/useAppLocale';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Button } from '@/src/ui/base/Button';
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
  const { t } = useTranslation();
  const { colorScheme, theme } = useAppTheme();
  const locale = useAppLocale();
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [draftDate, setDraftDate] = useState<Date | null>(null);
  const dateValue = useMemo(() => parseIso(value), [value]);
  const pickerValue = draftDate ?? dateValue;
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
  const focusBorderColor =
    colorScheme === 'dark' ? theme.colors.accent : theme.colors.primary;

  function handleChange(_: DateTimePickerEvent, selectedDate?: Date) {
    if (!selectedDate) {
      return;
    }
    setDraftDate(selectedDate);
  }

  function handleAndroidChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (event.type === 'dismissed' || !selectedDate) {
      closePicker();
      return;
    }

    onChange(
      mode === 'date' ? setDatePart(value, selectedDate) : setTimePart(value, selectedDate),
    );
    closePicker();
  }

  function confirmSelection() {
    const nextDate = draftDate ?? dateValue;
    onChange(mode === 'date' ? setDatePart(value, nextDate) : setTimePart(value, nextDate));
    setIsPickerVisible(false);
    setDraftDate(null);
  }

  function closePicker() {
    setIsPickerVisible(false);
    setDraftDate(null);
  }

  if (Platform.OS === 'web') {
    return (
      <View style={{ gap: theme.spacing.xs }}>
        <Text color="muted" variant="caption">
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
            backgroundColor: theme.colors.surfaceMuted,
            border: `1px solid transparent`,
            borderRadius: theme.radii.md,
            boxSizing: 'border-box',
            color: theme.colors.text,
            colorScheme,
            fontSize: 16,
            minHeight: 48,
            fontWeight: 400,
            outlineColor: focusBorderColor,
            padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
            paddingRight: 14,
            width: '100%',
          },
          type: mode,
          value: toWebInputValue(mode, dateValue),
        })}
      </View>
    );
  }

  if (Platform.OS === 'android') {
    return (
      <View style={{ gap: theme.spacing.xs }}>
        <Text color="muted" variant="caption">
          {label}
        </Text>
        <Pressable
          accessibilityLabel={label}
          accessibilityRole="button"
          onPress={() => setIsPickerVisible(true)}
          style={{
            backgroundColor: theme.colors.surfaceMuted,
            borderColor: focusBorderColor,
            borderRadius: theme.radii.md,
            borderWidth: isPickerVisible ? 1 : 0,
            justifyContent: 'center',
            minHeight: 44,
            paddingHorizontal: theme.spacing.md,
          }}>
          <Text weight="regular">{displayValue}</Text>
        </Pressable>
        {isPickerVisible ? (
          <DateTimePicker
            display="default"
            mode={mode}
            onChange={handleAndroidChange}
            themeVariant={colorScheme}
            value={dateValue}
          />
        ) : null}
      </View>
    );
  }

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text color="muted" variant="caption">
        {label}
      </Text>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={() => {
          setDraftDate(dateValue);
          setIsPickerVisible(true);
        }}
        style={{
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: focusBorderColor,
          borderRadius: theme.radii.md,
          borderWidth: isPickerVisible ? 1 : 0,
          justifyContent: 'center',
          minHeight: 44,
          paddingHorizontal: theme.spacing.md,
        }}>
        <Text weight="regular">{displayValue}</Text>
      </Pressable>
      <Modal
        animationType="fade"
        onRequestClose={closePicker}
        transparent
        visible={isPickerVisible}>
        <Pressable
          onPress={closePicker}
          style={{
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            flex: 1,
            justifyContent: 'center',
            padding: theme.spacing.xl,
          }}>
          <Pressable
            onPress={() => undefined}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radii.lg,
              maxWidth: 420,
              padding: theme.spacing.lg,
              width: '100%',
            }}>
            <Text weight="semibold">{label}</Text>
            <View style={{ alignItems: 'center', marginTop: theme.spacing.md }}>
              <DateTimePicker
                accentColor={focusBorderColor}
                display="spinner"
                mode={mode}
                onChange={handleChange}
                textColor={theme.colors.text}
                themeVariant={colorScheme}
                value={pickerValue}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                gap: theme.spacing.sm,
                justifyContent: 'flex-end',
                marginTop: theme.spacing.md,
              }}>
              <Button onPress={closePicker} title={t('common.cancel')} variant="ghost" />
              <Button onPress={confirmSelection} title={t('common.done')} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
