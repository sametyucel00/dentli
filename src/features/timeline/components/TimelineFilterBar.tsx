import { TimelineFilter, TIMELINE_FILTERS } from '@/src/features/timeline/model';
import { OptionPills } from '@/src/ui/base';

export function TimelineFilterBar({
  value,
  onChange,
  labelMap,
}: {
  value: TimelineFilter;
  onChange: (nextValue: TimelineFilter) => void;
  labelMap: (value: TimelineFilter) => string;
}) {
  return (
    <OptionPills
      containerStyle={{ justifyContent: 'center' }}
      labelMap={labelMap}
      onSelect={onChange}
      options={TIMELINE_FILTERS}
      selectedValue={value}
    />
  );
}
