import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SYMPTOM_SEVERITY_OPTIONS, SYMPTOM_TYPE_OPTIONS } from '@/src/domain/symptoms';
import { TOOTH_STATUS_OPTIONS } from '@/src/domain/teeth';
import {
  TimelineAppointmentDraft,
  TimelineHygieneDraft,
  TimelineItem,
  TimelineSymptomDraft,
  TimelineToothDraft,
} from '@/src/features/timeline/model';
import { getHygieneActionLabel } from '@/src/features/timeline/presentation';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { BottomSheetModal, Button, OptionPills, Text, TextField } from '@/src/ui/base';

export type TimelineEditorSheetProps = {
  visible: boolean;
  item: TimelineItem | null;
  symptomDraft: TimelineSymptomDraft;
  appointmentDraft: TimelineAppointmentDraft;
  hygieneDraft: TimelineHygieneDraft;
  toothDraft: TimelineToothDraft;
  onClose: () => void;
  onDelete: () => void;
  onSave: () => void;
  onCreateSymptom: () => void;
  onChangeSymptomDraft: (patch: Partial<TimelineSymptomDraft>) => void;
  onChangeAppointmentDraft: (patch: Partial<TimelineAppointmentDraft>) => void;
  onChangeHygieneDraft: (patch: Partial<TimelineHygieneDraft>) => void;
  onChangeToothDraft: (patch: Partial<TimelineToothDraft>) => void;
};

const APPOINTMENT_STATUSES: TimelineAppointmentDraft['status'][] = [
  'scheduled',
  'completed',
  'cancelled',
];
const APPOINTMENT_TYPES: TimelineAppointmentDraft['appointmentType'][] = [
  'checkup',
  'cleaning',
  'consultation',
  'treatment',
  'other',
];

export function TimelineEditorSheet({
  visible,
  item,
  symptomDraft,
  appointmentDraft,
  hygieneDraft,
  toothDraft,
  onClose,
  onDelete,
  onSave,
  onCreateSymptom,
  onChangeSymptomDraft,
  onChangeAppointmentDraft,
  onChangeHygieneDraft,
  onChangeToothDraft,
}: TimelineEditorSheetProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  return (
    <BottomSheetModal minHeight={420} onClose={onClose} visible={visible}>
      <View style={{ gap: theme.spacing.md }}>
        {item === null ? (
          <>
            <Text variant="title" weight="semibold">
              {t('timeline.newSymptom.title')}
            </Text>
            <OptionPills
              labelMap={(value) => t(`timeline.symptoms.${value}`)}
              onSelect={(value) => onChangeSymptomDraft({ symptomType: value })}
              options={SYMPTOM_TYPE_OPTIONS}
              selectedValue={symptomDraft.symptomType}
            />
            <OptionPills
              labelMap={(value) =>
                value === null ? t('timeline.newSymptom.noSeverity') : `${value}`
              }
              onSelect={(value) => onChangeSymptomDraft({ severity: value })}
              options={SYMPTOM_SEVERITY_OPTIONS}
              selectedValue={symptomDraft.severity}
            />
            <TextField
              keyboardType="number-pad"
              onChangeText={(value) => onChangeSymptomDraft({ toothNumber: value })}
              placeholder={t('timeline.newSymptom.toothPlaceholder')}
              value={symptomDraft.toothNumber}
            />
            <TextField
              onChangeText={(value) => onChangeSymptomDraft({ notes: value })}
              placeholder={t('timeline.newSymptom.notePlaceholder')}
              value={symptomDraft.notes}
            />
            <Button onPress={onCreateSymptom} title={t('timeline.newSymptom.save')} />
          </>
        ) : item.kind === 'symptom' ? (
          <>
            <Text variant="title" weight="semibold">
              {t('timeline.editSymptom.title')}
            </Text>
            <OptionPills
              labelMap={(value) => t(`timeline.symptoms.${value}`)}
              onSelect={(value) => onChangeSymptomDraft({ symptomType: value })}
              options={SYMPTOM_TYPE_OPTIONS}
              selectedValue={symptomDraft.symptomType}
            />
            <OptionPills
              labelMap={(value) =>
                value === null ? t('timeline.newSymptom.noSeverity') : `${value}`
              }
              onSelect={(value) => onChangeSymptomDraft({ severity: value })}
              options={SYMPTOM_SEVERITY_OPTIONS}
              selectedValue={symptomDraft.severity}
            />
            <TextField
              keyboardType="number-pad"
              onChangeText={(value) => onChangeSymptomDraft({ toothNumber: value })}
              placeholder={t('timeline.newSymptom.toothPlaceholder')}
              value={symptomDraft.toothNumber}
            />
            <TextField
              onChangeText={(value) => onChangeSymptomDraft({ notes: value })}
              placeholder={t('timeline.newSymptom.notePlaceholder')}
              value={symptomDraft.notes}
            />
            <TextField
              onChangeText={(value) => onChangeSymptomDraft({ occurredAt: value })}
              placeholder={t('timeline.common.datePlaceholder')}
              value={symptomDraft.occurredAt}
            />
            <Button onPress={onSave} title={t('timeline.common.save')} />
            <Button onPress={onDelete} title={t('timeline.common.delete')} variant="ghost" />
          </>
        ) : item.kind === 'appointment' ? (
          <>
            <Text variant="title" weight="semibold">
              {t('timeline.editAppointment.title')}
            </Text>
            <TextField
              onChangeText={(value) => onChangeAppointmentDraft({ title: value })}
              placeholder={t('timeline.editAppointment.titlePlaceholder')}
              value={appointmentDraft.title}
            />
            <OptionPills
              labelMap={(value) => t(`appointments.types.${value}`)}
              onSelect={(value) => onChangeAppointmentDraft({ appointmentType: value })}
              options={APPOINTMENT_TYPES}
              selectedValue={appointmentDraft.appointmentType}
            />
            <TextField
              onChangeText={(value) => onChangeAppointmentDraft({ clinicName: value })}
              placeholder={t('timeline.editAppointment.clinicPlaceholder')}
              value={appointmentDraft.clinicName}
            />
            <TextField
              onChangeText={(value) => onChangeAppointmentDraft({ doctorName: value })}
              placeholder={t('timeline.editAppointment.doctorPlaceholder')}
              value={appointmentDraft.doctorName}
            />
            <TextField
              onChangeText={(value) => onChangeAppointmentDraft({ startsAt: value })}
              placeholder={t('timeline.common.datePlaceholder')}
              value={appointmentDraft.startsAt}
            />
            <OptionPills
              labelMap={(value) => t(`timeline.appointmentStatus.${value}`)}
              onSelect={(value) => onChangeAppointmentDraft({ status: value })}
              options={APPOINTMENT_STATUSES}
              selectedValue={appointmentDraft.status}
            />
            <Button onPress={onSave} title={t('timeline.common.save')} />
            <Button onPress={onDelete} title={t('timeline.common.delete')} variant="ghost" />
          </>
        ) : item.kind === 'hygiene' ? (
          <>
            <Text variant="title" weight="semibold">
              {t('timeline.editHygiene.title')}
            </Text>
            <Text color="muted">
              {getHygieneActionLabel(item.event.actionKey, item.event.eventType, t)}
            </Text>
            <TextField
              onChangeText={(value) => onChangeHygieneDraft({ occurredAt: value })}
              placeholder={t('timeline.common.datePlaceholder')}
              value={hygieneDraft.occurredAt}
            />
            <TextField
              onChangeText={(value) => onChangeHygieneDraft({ notes: value })}
              placeholder={t('timeline.newSymptom.notePlaceholder')}
              value={hygieneDraft.notes}
            />
            <Button onPress={onSave} title={t('timeline.common.save')} />
            <Button onPress={onDelete} title={t('timeline.common.delete')} variant="ghost" />
          </>
        ) : (
          <>
            <Text variant="title" weight="semibold">
              {t('timeline.editTooth.title', { toothNumber: item.event.toothNumber })}
            </Text>
            <OptionPills
              labelMap={(value) => t(`toothMap.status.${value}`)}
              onSelect={(value) => onChangeToothDraft({ status: value })}
              options={TOOTH_STATUS_OPTIONS}
              selectedValue={toothDraft.status}
            />
            <TextField
              onChangeText={(value) => onChangeToothDraft({ note: value })}
              placeholder={t('timeline.newSymptom.notePlaceholder')}
              value={toothDraft.note}
            />
            <TextField
              onChangeText={(value) => onChangeToothDraft({ recordedAt: value })}
              placeholder={t('timeline.common.datePlaceholder')}
              value={toothDraft.recordedAt}
            />
            <Button onPress={onSave} title={t('timeline.common.save')} />
            <Button onPress={onDelete} title={t('timeline.common.delete')} variant="ghost" />
          </>
        )}
      </View>
    </BottomSheetModal>
  );
}
