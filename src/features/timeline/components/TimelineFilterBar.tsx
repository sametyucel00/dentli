import { useWindowDimensions } from 'react-native';

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
  const { width } = useWindowDimensions();

  return (
    <OptionPills
      columns={width < 390 ? 2 : 3}
      containerStyle={{ justifyContent: 'center' }}
      labelMap={labelMap}
      onSelect={onChange}
      options={TIMELINE_FILTERS}
      selectedValue={value}
    />
  );
}
