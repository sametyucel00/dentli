import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ToothStatus, ToothStatusHistory } from '@/src/domain/models';
import { TOOTH_STATUS_OPTIONS } from '@/src/domain/teeth';
import { formatDateTime } from '@/src/features/today/formatters';
import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';
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
  const { isExpanded } = useResponsiveLayout();
  const locale = useAppLocale();
  const [notesOpen, setNotesOpen] = useState(Boolean(note));
  const [historyOpen, setHistoryOpen] = useState(false);

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

        <View
          style={{
            flexDirection: isExpanded ? 'row' : 'column',
            gap: theme.spacing.lg,
          }}>
          <View style={{ flex: isExpanded ? 1 : undefined, gap: theme.spacing.md }}>
            <OptionPills
              columns={3}
              containerStyle={{ justifyContent: 'center' }}
              labelMap={(value) => t(`toothMap.status.${value}`)}
              onSelect={(value) => onChangeStatus(value)}
              options={TOOTH_STATUS_OPTIONS}
              selectedValue={status}
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
                onChangeText={onChangeNote}
                placeholder={t('toothMap.editor.notePlaceholder')}
                value={note}
              />
            ) : null}

            <Button
              disabled={busy}
              onPress={onSave}
              style={{ alignSelf: 'center', minWidth: 220, width: isExpanded ? '82%' : '72%' }}
              title={busy ? t('toothMap.editor.saving') : t('toothMap.editor.save')}
            />
          </View>

          <View style={{ flex: isExpanded ? 1 : undefined, gap: theme.spacing.sm }}>
            <Button
              onPress={() => setHistoryOpen((current) => !current)}
              title={t(historyOpen ? 'common.hideHistory' : 'common.showHistory')}
              variant="ghost"
            />
            {historyOpen ? (
              history.length === 0 ? (
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
              )
            ) : (
              <Text color="muted">{t('toothMap.editor.historyTitle')}</Text>
            )}
          </View>
        </View>
      </View>
    </BottomSheetModal>
  );
}
