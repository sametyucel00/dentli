import { View } from 'react-native';

import { Text } from '@/src/ui/base';

export function TodayStatusRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
      <Text color="muted">{label}</Text>
      <Text
        color={accent ? 'primary' : 'default'}
        weight="semibold"
        style={{ flexShrink: 1, textAlign: 'right' }}>
        {value}
      </Text>
    </View>
  );
}
