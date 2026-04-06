import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { CARE_ITEM_TYPE_OPTIONS } from '@/src/domain/care';
import { CareItemDraft } from '@/src/features/care/model';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Button, DateTimeField, OptionPills, Text, TextField } from '@/src/ui/base';

export function CareItemForm({
  allowAdvancedTypes = true,
  draft,
  title,
  submitLabel,
  onChange,
  onSubmit,
  onDelete,
}: {
  allowAdvancedTypes?: boolean;
  draft: CareItemDraft;
  title: string;
  submitLabel: string;
  onChange: (patch: Partial<CareItemDraft>) => void;
  onSubmit: () => void;
  onDelete?: () => void;
}) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const availableTypes = allowAdvancedTypes
    ? CARE_ITEM_TYPE_OPTIONS
    : CARE_ITEM_TYPE_OPTIONS.filter((value) =>
        ['toothbrush', 'toothpaste', 'floss', 'mouthwash'].includes(value),
      );

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
        containerStyle={{ justifyContent: 'center' }}
        labelMap={(value) => t(`careTracking.types.${value}`)}
        onSelect={(value) => onChange({ itemType: value })}
        options={availableTypes}
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
        placeholder={t('careTracking.form.replacementDaysPlaceholder')}
        value={draft.replacementCycleDays}
      />
      <View style={{ gap: theme.spacing.md }}>
        <DateTimeField
          label={t('careTracking.form.lastReplacedDate')}
          mode="date"
          onChange={(value) => onChange({ lastReplacedAt: value })}
          value={draft.lastReplacedAt}
        />
        <DateTimeField
          label={t('careTracking.form.lastReplacedTime')}
          mode="time"
          onChange={(value) => onChange({ lastReplacedAt: value })}
          value={draft.lastReplacedAt}
        />
      </View>
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
          style={{ flexBasis: onDelete ? '48%' : '72%', minWidth: 0 }}
          title={submitLabel}
        />
        {onDelete ? (
          <Button
            onPress={onDelete}
            style={{ flexBasis: '48%', minWidth: 0 }}
            title={t('careTracking.form.delete')}
            variant="ghost"
          />
        ) : null}
      </View>
    </View>
  );
}
