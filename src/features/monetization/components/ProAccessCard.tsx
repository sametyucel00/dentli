import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { PremiumFeatureKey } from '@/src/domain/models';
import { useMonetization } from '@/src/features/monetization/useMonetization';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Button, Card, StateMessageCard, Text } from '@/src/ui/base';

export function ProAccessCard({
  title,
  body,
  featureKeys,
}: {
  title?: string;
  body?: string;
  featureKeys?: PremiumFeatureKey[];
}) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const monetization = useMonetization();
  const product = monetization.productList[0] ?? null;

  return (
    <Card style={{ marginTop: theme.spacing.lg }}>
      <Text variant="title" weight="semibold">
        {title ?? t('monetization.paywall.title')}
      </Text>
      <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
        {body ?? t('monetization.paywall.body')}
      </Text>

      {monetization.error ? (
        <StateMessageCard body={monetization.error} title={t('common.errorTitle')} />
      ) : null}
      {monetization.notice ? (
        <StateMessageCard title={t(`monetization.status.${monetization.notice}`)} />
      ) : null}

      {product ? (
        <View style={{ marginTop: theme.spacing.lg }}>
          <Text weight="semibold">{t(product.titleKey)}</Text>
          <Text color="muted" style={{ marginTop: theme.spacing.xs }}>
            {t(product.descriptionKey)}
          </Text>
          <Text color="primary" style={{ marginTop: theme.spacing.sm }} weight="semibold">
            {product.storePriceLabel ?? t(product.priceLabelKey)}
          </Text>
          <Text color="muted" style={{ marginTop: theme.spacing.sm }} variant="caption">
            {t('monetization.paywall.trustLine')}
          </Text>
        </View>
      ) : null}

      {featureKeys && featureKeys.length > 0 ? (
        <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
          <Text weight="semibold">{t('monetization.paywall.includesTitle')}</Text>
          {featureKeys.map((featureKey) => (
            <Text key={featureKey} color="muted">
              {'\u2022'} {t(`monetization.features.${featureKey}`)}
            </Text>
          ))}
        </View>
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.md,
          marginTop: theme.spacing.lg,
        }}>
        <Button
          disabled={monetization.loading || monetization.purchaseInFlight}
          onPress={() => void monetization.purchasePro()}
          title={t('monetization.actions.unlock')}
        />
        <Button
          disabled={monetization.loading || monetization.purchaseInFlight}
          onPress={() => void monetization.restorePurchases()}
          title={t('monetization.actions.restore')}
          variant="ghost"
        />
      </View>
    </Card>
  );
}
