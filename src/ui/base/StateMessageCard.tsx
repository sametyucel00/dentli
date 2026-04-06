import { ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';

import { useAppTheme } from '@/src/theme/useAppTheme';
import { Button } from '@/src/ui/base/Button';
import { Card } from '@/src/ui/base/Card';
import { Text } from '@/src/ui/base/Text';

type StateMessageCardProps = {
  title: string;
  body?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  children?: ReactNode;
};

export function StateMessageCard({
  title,
  body,
  actionLabel,
  onActionPress,
  children,
}: StateMessageCardProps) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const isCompactWidth = width < 390;

  return (
    <Card style={{ marginTop: theme.spacing.lg }}>
      <Text style={{ textAlign: 'center' }} weight="semibold">
        {title}
      </Text>
      {body ? (
        <Text color="muted" style={{ marginTop: theme.spacing.sm, textAlign: 'center' }}>
          {body}
        </Text>
      ) : null}
      {children ? <View style={{ marginTop: theme.spacing.md }}>{children}</View> : null}
      {actionLabel && onActionPress ? (
        <Button
          onPress={onActionPress}
          style={{
            alignSelf: 'center',
            marginTop: theme.spacing.lg,
            maxWidth: 320,
            minWidth: isCompactWidth ? 180 : 220,
            width: isCompactWidth ? '76%' : '68%',
          }}
          title={actionLabel}
          variant="secondary"
        />
      ) : null}
    </Card>
  );
}
