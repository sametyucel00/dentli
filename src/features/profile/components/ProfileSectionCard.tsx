import { ReactNode } from 'react';

import { useAppTheme } from '@/src/theme/useAppTheme';
import { Card, Text } from '@/src/ui/base';

type ProfileSectionCardProps = {
  title: string;
  description: string;
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
};

export function ProfileSectionCard({
  title,
  description,
  loading = false,
  loadingLabel,
  children,
}: ProfileSectionCardProps) {
  const { theme } = useAppTheme();

  return (
    <Card style={{ marginTop: theme.spacing.lg }}>
      <Text variant="title" weight="semibold">
        {title}
      </Text>
      <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
        {description}
      </Text>
      {loading ? (
        <Text color="muted" style={{ marginTop: theme.spacing.lg }}>
          {loadingLabel}
        </Text>
      ) : (
        children
      )}
    </Card>
  );
}
