import { View } from 'react-native';

import { useAppTheme } from '@/src/theme/useAppTheme';
import { Button } from '@/src/ui/base/Button';
import { Text } from '@/src/ui/base/Text';

type ActionBannerProps = {
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function ActionBanner({
  message,
  actionLabel,
  onActionPress,
}: ActionBannerProps) {
  const { theme } = useAppTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceAccent,
        borderColor: theme.colors.border,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginTop: theme.spacing.lg,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
      }}>
      <Text style={{ flex: 1 }} weight="medium">
        {message}
      </Text>
      {actionLabel && onActionPress ? (
        <Button
          onPress={onActionPress}
          style={{ minWidth: 0, paddingHorizontal: theme.spacing.md }}
          title={actionLabel}
          variant="ghost"
        />
      ) : null}
    </View>
  );
}
