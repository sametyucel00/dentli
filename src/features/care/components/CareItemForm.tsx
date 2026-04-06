import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { CARE_ITEM_TYPE_OPTIONS, DEFAULT_CARE_ITEM_REPLACEMENT_DAYS } from '@/src/domain/care';
import { CareItemDraft } from '@/src/features/care/model';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Button, DateTimeField, OptionPills, Text, TextField } from '@/src/ui/base';

export function CareItemForm({
  draft,
  title,
  submitLabel,
  onChange,
  onSubmit,
  onDelete,
}: {
  draft: CareItemDraft;
  title: string;
  submitLabel: string;
  onChange: (patch: Partial<CareItemDraft>) => void;
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
        placeholder={t('careTracking.form.title')}
        value={draft.title}
      />
      <OptionPills
        labelMap={(value) => t(`careTracking.types.${value}`)}
        onSelect={(value) =>
          onChange({
            itemType: value,
            replacementCycleDays: `${DEFAULT_CARE_ITEM_REPLACEMENT_DAYS[value] ?? ''}`,
          })
        }
        options={CARE_ITEM_TYPE_OPTIONS}
        selectedValue={draft.itemType}
      />
      <TextField
        onChangeText={(value) => onChange({ description: value })}
        placeholder={t('careTracking.form.description')}
        value={draft.description}
      />
      <TextField
        keyboardType="number-pad"
        onChangeText={(value) => onChange({ replacementCycleDays: value })}
        placeholder={t('careTracking.form.replacementDays')}
        value={draft.replacementCycleDays}
      />
      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <View style={{ flex: 1 }}>
          <DateTimeField
            label={t('careTracking.form.lastReplacedDate')}
            mode="date"
            onChange={(value) => onChange({ lastReplacedAt: value })}
            value={draft.lastReplacedAt}
          />
        </View>
        <View style={{ flex: 1 }}>
          <DateTimeField
            label={t('careTracking.form.lastReplacedTime')}
            mode="time"
            onChange={(value) => onChange({ lastReplacedAt: value })}
            value={draft.lastReplacedAt}
          />
        </View>
      </View>
      <Button disabled={!draft.title.trim()} onPress={onSubmit} title={submitLabel} />
      {onDelete ? (
        <Button onPress={onDelete} title={t('careTracking.form.delete')} variant="ghost" />
      ) : null}
    </View>
  );
}
