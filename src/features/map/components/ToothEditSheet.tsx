import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ToothStatus, ToothStatusHistory } from '@/src/domain/models';
import { TOOTH_STATUS_OPTIONS } from '@/src/domain/teeth';
import { formatDateTime } from '@/src/features/today/formatters';
import { useAppLocale } from '@/src/i18n/useAppLocale';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { BottomSheetModal, Button, OptionPills, Text, TextField } from '@/src/ui/base';

type ToothEditSheetProps = {
  visible: boolean;
  toothNumber: number | null;
  status: ToothStatus;
  note: string;
  recordedAt: string | null;
  history: ToothStatusHistory[];
  busy: boolean;
  error: string | null;
  onChangeStatus: (status: ToothStatus) => void;
  onChangeNote: (note: string) => void;
  onSave: () => void;
  onClose: () => void;
};

export function ToothEditSheet({
  visible,
  toothNumber,
  status,
  note,
  recordedAt,
  history,
  busy,
  error,
  onChangeStatus,
  onChangeNote,
  onSave,
  onClose,
}: ToothEditSheetProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const locale = useAppLocale();

  return (
    <BottomSheetModal minHeight={420} onClose={onClose} visible={visible}>
      <View style={{ gap: theme.spacing.md }}>
        <Text variant="title" weight="semibold">
          {t('toothMap.editor.title', { toothNumber })}
        </Text>
        {error ? <Text style={{ color: theme.colors.danger }}>{error}</Text> : null}
        <Text color="muted">
          {recordedAt
            ? t('toothMap.editor.lastUpdated', {
                value: formatDateTime(recordedAt, locale, t('toothMap.common.notRecorded')),
              })
            : t('toothMap.common.notRecorded')}
        </Text>

        <OptionPills
          containerStyle={{ justifyContent: 'center' }}
          labelMap={(value) => t(`toothMap.status.${value}`)}
          onSelect={(value) => onChangeStatus(value)}
          options={TOOTH_STATUS_OPTIONS}
          selectedValue={status}
        />

        <TextField
          onChangeText={onChangeNote}
          placeholder={t('toothMap.editor.notePlaceholder')}
          value={note}
        />

        <Button
          disabled={busy}
          onPress={onSave}
          style={{ alignSelf: 'center', minWidth: 220, width: '72%' }}
          title={busy ? t('toothMap.editor.saving') : t('toothMap.editor.save')}
        />

        <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
          <Text weight="semibold">{t('toothMap.editor.historyTitle')}</Text>
          {history.length === 0 ? (
            <Text color="muted">{t('toothMap.editor.emptyHistory')}</Text>
          ) : (
            history.map((entry) => (
              <View
                key={entry.id}
                style={{
                  borderBottomColor: theme.colors.border,
                  borderBottomWidth: 1,
                  paddingBottom: theme.spacing.sm,
                }}>
                <Text weight="semibold">{t(`toothMap.status.${entry.status}`)}</Text>
                <Text color="muted" style={{ marginTop: theme.spacing.xs }}>
                  {formatDateTime(entry.recordedAt, locale, t('toothMap.common.notRecorded'))}
                </Text>
                {entry.note ? (
                  <Text color="muted" style={{ marginTop: theme.spacing.xs }}>
                    {entry.note}
                  </Text>
                ) : null}
              </View>
            ))
          )}
        </View>
      </View>
    </BottomSheetModal>
  );
}
