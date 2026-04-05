import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { InsightItem } from '@/src/features/insights/model';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Card, Text } from '@/src/ui/base';

function getInsightBackgroundColor(
  tone: InsightItem['tone'],
  colors: ReturnType<typeof useAppTheme>['theme']['colors'],
) {
  if (tone === 'warning') return colors.surfaceAccent;
  if (tone === 'positive') return colors.primarySoft;
  return colors.surfaceMuted;
}

type ProfileInsightsSectionProps = {
  insights: InsightItem[];
  loading: boolean;
  loadingLabel: string;
};

export function ProfileInsightsSection({
  insights,
  loading,
  loadingLabel,
}: ProfileInsightsSectionProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  return (
    <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
      <Text variant="title" weight="semibold">
        {t('profile.insights.title')}
      </Text>
      <Text color="muted">{t('profile.insights.body')}</Text>
      {loading ? (
        <Card>
          <Text color="muted">{loadingLabel}</Text>
        </Card>
      ) : insights.length === 0 ? (
        <Card>
          <Text weight="semibold">{t('profile.insights.emptyTitle')}</Text>
          <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
            {t('profile.insights.emptyBody')}
          </Text>
        </Card>
      ) : (
        insights.map((insight) => (
          <Card
            key={insight.id}
            style={{
              backgroundColor: getInsightBackgroundColor(insight.tone, theme.colors),
            }}>
            <Text weight="semibold">{t(insight.titleKey, insight.bodyValues)}</Text>
            <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
              {t(insight.bodyKey, insight.bodyValues)}
            </Text>
          </Card>
        ))
      )}
    </View>
  );
}
