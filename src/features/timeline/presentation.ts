import { TFunction } from 'i18next';

import { HygieneEvent } from '@/src/domain/models';
import { TimelineItem } from '@/src/features/timeline/model';

export function getHygieneActionLabel(
  actionKey: HygieneEvent['actionKey'],
  eventType: HygieneEvent['eventType'],
  t: TFunction,
) {
  if (actionKey === 'morning_brush') return t('today.actions.morningBrush');
  if (actionKey === 'night_brush') return t('today.actions.nightBrush');
  if (actionKey === 'floss') return t('today.actions.floss');
  if (actionKey === 'mouthwash') return t('today.actions.mouthwash');

  return t(`timeline.hygiene.${eventType}`);
}

export function getTimelineItemIcon(kind: TimelineItem['kind']) {
  switch (kind) {
    case 'hygiene':
      return 'sparkles-outline' as const;
    case 'symptom':
      return 'pulse-outline' as const;
    case 'appointment':
      return 'calendar-outline' as const;
    case 'tooth':
      return 'grid-outline' as const;
  }
}

export function getTimelineItemCopy(item: TimelineItem, t: TFunction) {
  if (item.kind === 'hygiene') {
    return {
      title: getHygieneActionLabel(item.event.actionKey, item.event.eventType, t),
      subtitle: item.event.notes ?? t('timeline.common.noNote'),
    };
  }

  if (item.kind === 'symptom') {
    return {
      title: t(`timeline.symptoms.${item.event.symptomType}`),
      subtitle:
        item.event.toothNumber !== null
          ? t('timeline.symptomToothLink', { toothNumber: item.event.toothNumber })
          : item.event.notes ?? t('timeline.common.noNote'),
    };
  }

  if (item.kind === 'appointment') {
    return {
      title: item.event.title,
      subtitle: item.event.providerName ?? t('timeline.common.noProvider'),
    };
  }

  return {
    title: t(`toothMap.status.${item.event.status}`),
    subtitle: t('timeline.toothUpdateLink', { toothNumber: item.event.toothNumber }),
  };
}
