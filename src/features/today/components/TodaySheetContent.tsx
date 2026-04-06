import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SymptomType, ToothStatus } from '@/src/domain/models';
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
  submitSymptom: () => Promise<void>;
  appointmentTitle: string;
  setAppointmentTitle: (value: string) => void;
  appointmentProvider: string;
  setAppointmentProvider: (value: string) => void;
  appointmentStartsAt: string;
  setAppointmentStartsAt: (value: string) => void;
  submitAppointment: (defaultTitle: string) => Promise<void>;
  toothNumber: string;
  setToothNumber: (value: string) => void;
  toothStatus: ToothStatus;
  setToothStatus: (value: ToothStatus) => void;
  toothNote: string;
  setToothNote: (value: string) => void;
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
      </View>
    );
  }

  if (today.sheetMode === 'symptom') {
    return (
      <View style={{ gap: theme.spacing.md }}>
        <Text variant="title" weight="semibold">
          {t('today.sheet.addSymptom')}
        </Text>
        <OptionPills
          containerStyle={{ justifyContent: 'center' }}
          options={SYMPTOM_TYPE_OPTIONS}
          selectedValue={today.symptomType}
          onSelect={(value) => today.setSymptomType(value)}
          labelMap={(value) => t(`today.symptoms.${value}`)}
        />
        <OptionPills
          containerStyle={{ justifyContent: 'center' }}
          options={[null, 1, 2, 3, 4, 5]}
          selectedValue={today.symptomSeverity}
          onSelect={(value) => today.setSymptomSeverity(value)}
          labelMap={(value) => (value === null ? t('today.sheet.noSeverity') : `${value}`)}
        />
        <TextField
          value={today.symptomTooth}
          onChangeText={today.setSymptomTooth}
          placeholder={t('today.sheet.toothNumber')}
          keyboardType="number-pad"
        />
        <TextField
          multiline
          numberOfLines={4}
          value={today.symptomNote}
          onChangeText={today.setSymptomNote}
          placeholder={t('today.sheet.note')}
        />
        <Button
          disabled={!today.symptomNote.trim() && !today.symptomTooth.trim()}
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
        <Text variant="title" weight="semibold">
          {t('today.sheet.addAppointment')}
        </Text>
        <TextField
          value={today.appointmentTitle}
          onChangeText={today.setAppointmentTitle}
          placeholder={t('today.sheet.appointmentTitle')}
        />
        <TextField
          value={today.appointmentProvider}
          onChangeText={today.setAppointmentProvider}
          placeholder={t('today.sheet.providerName')}
        />
        <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: theme.spacing.md }}>
          <View style={{ flex: 1 }}>
            <DateTimeField
              label={t('today.sheet.startDate')}
              mode="date"
              onChange={today.setAppointmentStartsAt}
              value={today.appointmentStartsAt}
            />
          </View>
          <View style={{ flex: 1 }}>
            <DateTimeField
              label={t('today.sheet.startTime')}
              mode="time"
              onChange={today.setAppointmentStartsAt}
              value={today.appointmentStartsAt}
            />
          </View>
        </View>
        <Button
          disabled={!today.appointmentStartsAt.trim()}
          style={{ alignSelf: 'center', minWidth: 220, width: '72%' }}
          title={t('today.sheet.save')}
          onPress={() => void today.submitAppointment(t('today.sheet.defaultAppointmentTitle'))}
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
          containerStyle={{ justifyContent: 'center' }}
          options={TOOTH_STATUS_OPTIONS}
          selectedValue={today.toothStatus}
          onSelect={(value) => today.setToothStatus(value)}
          labelMap={(value) => t(`today.toothStatus.${value}`)}
        />
        <TextField
          multiline
          numberOfLines={4}
          value={today.toothNote}
          onChangeText={today.setToothNote}
          placeholder={t('today.sheet.note')}
        />
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
              title={today.timerActive ? t('today.sheet.pauseTimer') : t('today.sheet.startTimer')}
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
