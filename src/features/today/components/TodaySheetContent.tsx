import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppointmentDraft } from '@/src/features/appointments/model';
import { AppointmentForm } from '@/src/features/appointments/components/AppointmentForm';
import { SymptomType, ToothStatus } from '@/src/domain/models';
import { SYMPTOM_SEVERITY_OPTIONS } from '@/src/domain/symptoms';
import { TOOTH_STATUS_OPTIONS } from '@/src/domain/teeth';
import {
  BrushCompletionChoice,
  SYMPTOM_TYPE_OPTIONS,
  TodaySheetMode,
} from '@/src/features/today/model';
import { TodayBrushTimer } from '@/src/features/today/components/TodayBrushTimer';
import { TodaySheetAction } from '@/src/features/today/components/TodaySheetAction';
import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Button, DateTimeField, OptionPills, Text, TextField } from '@/src/ui/base';

type TodayViewModel = {
  sheetMode: TodaySheetMode;
  openSheet: (mode: TodaySheetMode) => void;
  openTimer: () => void;
  symptomType: SymptomType;
  setSymptomType: (value: SymptomType) => void;
  symptomSeverity: number | null;
  setSymptomSeverity: (value: number | null) => void;
  symptomTooth: string;
  setSymptomTooth: (value: string) => void;
  symptomNote: string;
  setSymptomNote: (value: string) => void;
  symptomOccurredAt: string;
  setSymptomOccurredAt: (value: string) => void;
  submitSymptom: () => Promise<void>;
  appointmentDraft: AppointmentDraft;
  patchAppointmentDraft: (patch: Partial<AppointmentDraft>) => void;
  submitAppointment: (defaultTitle: string) => Promise<void>;
  toothNumber: string;
  setToothNumber: (value: string) => void;
  toothStatus: ToothStatus;
  setToothStatus: (value: ToothStatus) => void;
  toothNote: string;
  setToothNote: (value: string) => void;
  toothRecordedAt: string;
  setToothRecordedAt: (value: string) => void;
  submitToothUpdate: () => Promise<void>;
  addExtraCareEvent: (actionKey: 'floss' | 'mouthwash') => Promise<void>;
  timerActive: boolean;
  toggleTimerRunning: () => void;
  resetTimer: () => void;
  timerCompletionPromptVisible: boolean;
  completeBrushTimer: (choice: BrushCompletionChoice) => Promise<void>;
  timerProgress: number;
  activeQuadrantIndex: number;
  timerQuadrants: readonly { id: string; titleKey: string }[];
  secondsLeft: number;
};

export function TodaySheetContent({ today }: { today: TodayViewModel }) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { isTablet } = useResponsiveLayout();
  const [extraActionsOpen, setExtraActionsOpen] = useState(false);
  const [symptomNotesOpen, setSymptomNotesOpen] = useState(false);
  const [toothNotesOpen, setToothNotesOpen] = useState(false);

  useEffect(() => {
    setExtraActionsOpen(false);
    setSymptomNotesOpen(Boolean(today.symptomNote));
    setToothNotesOpen(Boolean(today.toothNote));
  }, [today.sheetMode, today.symptomNote, today.toothNote]);

  const localizedTimerQuadrants = today.timerQuadrants.map((quadrant) => ({
    id: quadrant.id,
    label: t(quadrant.titleKey),
  }));

  if (today.sheetMode === 'actions') {
    return (
      <View style={{ gap: theme.spacing.md }}>
        <Text variant="title" weight="semibold">
          {t('today.sheet.title')}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.sm,
            justifyContent: 'center',
          }}>
          <TodaySheetAction
            description={t('today.sheet.addSymptomHint')}
            icon="pulse-outline"
            label={t('today.sheet.addSymptom')}
            onPress={() => today.openSheet('symptom')}
          />
          <TodaySheetAction
            description={t('today.sheet.addAppointmentHint')}
            icon="calendar-outline"
            label={t('today.sheet.addAppointment')}
            onPress={() => today.openSheet('appointment')}
          />
          <TodaySheetAction
            description={t('today.sheet.openTimerHint')}
            icon="timer-outline"
            label={t('today.sheet.openTimer')}
            onPress={today.openTimer}
          />
          <TodaySheetAction
            description={t('today.sheet.updateToothHint')}
            icon="grid-outline"
            label={t('today.sheet.updateTooth')}
            onPress={() => today.openSheet('tooth')}
          />
        </View>
        <Button
          onPress={() => setExtraActionsOpen((current) => !current)}
          title={t(extraActionsOpen ? 'common.hideOptionalDetails' : 'common.optionalDetails')}
          variant="ghost"
        />
        {extraActionsOpen ? (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: theme.spacing.sm,
              justifyContent: 'center',
            }}>
            <TodaySheetAction
              description={t('today.sheet.addExtraFlossHint')}
              icon="add-circle-outline"
              label={t('today.sheet.addExtraFloss')}
              onPress={() => void today.addExtraCareEvent('floss')}
            />
            <TodaySheetAction
              description={t('today.sheet.addExtraMouthwashHint')}
              icon="add-circle-outline"
              label={t('today.sheet.addExtraMouthwash')}
              onPress={() => void today.addExtraCareEvent('mouthwash')}
            />
          </View>
        ) : null}
      </View>
    );
  }

  if (today.sheetMode === 'symptom') {
    return (
      <View style={{ gap: theme.spacing.md }}>
        <Text variant="title" weight="semibold">
          {t('today.sheet.addSymptom')}
        </Text>
        <Text variant="caption" color="muted" weight="semibold">
          {t('today.sheet.symptomCategory')}
        </Text>
        <OptionPills
          columns={2}
          containerStyle={{ justifyContent: 'center' }}
          options={SYMPTOM_TYPE_OPTIONS}
          selectedValue={today.symptomType}
          onSelect={(value) => today.setSymptomType(value)}
          labelMap={(value) => t(`today.symptoms.${value}`)}
        />
        <Text variant="caption" color="muted" weight="semibold">
          {t('today.sheet.symptomSeverity')}
        </Text>
        <OptionPills
          columns={2}
          containerStyle={{ justifyContent: 'center' }}
          options={SYMPTOM_SEVERITY_OPTIONS}
          selectedValue={today.symptomSeverity}
          onSelect={(value) => today.setSymptomSeverity(value)}
          labelMap={(value) =>
            value === null ? t('today.sheet.noSeverity') : t(`today.sheet.severity.${value}`)
          }
        />
        <TextField
          value={today.symptomTooth}
          onChangeText={today.setSymptomTooth}
          placeholder={t('today.sheet.toothNumber')}
          keyboardType="number-pad"
        />
        <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: theme.spacing.md }}>
          <View style={{ flex: 1 }}>
            <DateTimeField
              label={t('timeline.common.date')}
              mode="date"
              onChange={today.setSymptomOccurredAt}
              value={today.symptomOccurredAt}
            />
          </View>
          <View style={{ flex: 1 }}>
            <DateTimeField
              label={t('timeline.common.time')}
              mode="time"
              onChange={today.setSymptomOccurredAt}
              value={today.symptomOccurredAt}
            />
          </View>
        </View>
        <Button
          onPress={() => setSymptomNotesOpen((current) => !current)}
          title={t(symptomNotesOpen ? 'common.hideNotes' : 'common.showNotes')}
          variant="ghost"
        />
        {symptomNotesOpen ? (
          <TextField
            multiline
            numberOfLines={4}
            value={today.symptomNote}
            onChangeText={today.setSymptomNote}
            placeholder={t('today.sheet.note')}
          />
        ) : null}
        <Button
          style={{ alignSelf: 'center', minWidth: 220, width: '72%' }}
          title={t('today.sheet.save')}
          onPress={() => void today.submitSymptom()}
        />
      </View>
    );
  }

  if (today.sheetMode === 'appointment') {
    return (
      <View style={{ gap: theme.spacing.md }}>
        <AppointmentForm
          draft={today.appointmentDraft}
          onChange={today.patchAppointmentDraft}
          onSubmit={() => void today.submitAppointment(t('today.sheet.defaultAppointmentTitle'))}
          submitLabel={t('today.sheet.save')}
          title={t('today.sheet.addAppointment')}
        />
      </View>
    );
  }

  if (today.sheetMode === 'tooth') {
    return (
      <View style={{ gap: theme.spacing.md }}>
        <Text variant="title" weight="semibold">
          {t('today.sheet.updateTooth')}
        </Text>
        <TextField
          value={today.toothNumber}
          onChangeText={today.setToothNumber}
          placeholder={t('today.sheet.toothNumber')}
          keyboardType="number-pad"
        />
        <OptionPills
          columns={3}
          containerStyle={{ justifyContent: 'center' }}
          options={TOOTH_STATUS_OPTIONS}
          selectedValue={today.toothStatus}
          onSelect={(value) => today.setToothStatus(value)}
          labelMap={(value) => t(`today.toothStatus.${value}`)}
        />
        <Text variant="caption" color="muted" weight="semibold">
          {t('today.sheet.recordDate')}
        </Text>
        <DateTimeField
          label={t('timeline.common.date')}
          mode="date"
          onChange={today.setToothRecordedAt}
          value={today.toothRecordedAt}
        />
        <Button
          onPress={() => setToothNotesOpen((current) => !current)}
          title={t(toothNotesOpen ? 'common.hideNotes' : 'common.showNotes')}
          variant="ghost"
        />
        {toothNotesOpen ? (
          <TextField
            multiline
            numberOfLines={4}
            value={today.toothNote}
            onChangeText={today.setToothNote}
            placeholder={t('today.sheet.note')}
          />
        ) : null}
        <Button
          disabled={!today.toothNumber.trim()}
          style={{ alignSelf: 'center', minWidth: 220, width: '72%' }}
          title={t('today.sheet.save')}
          onPress={() => void today.submitToothUpdate()}
        />
      </View>
    );
  }

  if (today.sheetMode === 'timer') {
    return (
      <View style={{ gap: theme.spacing.md }}>
        <Text variant="title" weight="semibold">
          {t('today.sheet.timer')}
        </Text>
        <TodayBrushTimer
          activeQuadrantIndex={today.activeQuadrantIndex}
          progress={today.timerProgress}
          quadrants={localizedTimerQuadrants}
          secondsLeft={today.secondsLeft}
          title={t('today.timer.title')}
        />
        <Text color="muted" style={{ textAlign: 'center' }}>
          {t('today.timer.helper')}
        </Text>
        {today.timerCompletionPromptVisible ? (
          <View style={{ gap: theme.spacing.sm }}>
            <Text style={{ textAlign: 'center' }} weight="semibold">
              {t('today.timer.completionPrompt')}
            </Text>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <Button
                title={t('today.timer.markMorning')}
                onPress={() => void today.completeBrushTimer('morning_brush')}
                style={{ flex: 1, minWidth: 0 }}
              />
              <Button
                title={t('today.timer.markNight')}
                onPress={() => void today.completeBrushTimer('night_brush')}
                style={{ flex: 1, minWidth: 0 }}
              />
            </View>
          </View>
        ) : (
          <>
            <Button
              title={
                today.timerActive
                  ? t('today.sheet.pauseTimer')
                  : today.secondsLeft < 120
                    ? t('today.sheet.resumeTimer')
                    : t('today.sheet.startTimer')
              }
              onPress={today.toggleTimerRunning}
            />
            <Button
              title={t('today.sheet.resetTimer')}
              variant="ghost"
              onPress={today.resetTimer}
            />
          </>
        )}
      </View>
    );
  }

  return null;
}
