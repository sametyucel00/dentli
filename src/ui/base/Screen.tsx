import { PropsWithChildren, useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';
import { useAppTheme } from '@/src/theme/useAppTheme';

type Props = PropsWithChildren<{
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  contentMaxWidth?: number;
}>;

export function Screen({
  children,
  scroll = true,
  contentContainerStyle,
  contentMaxWidth,
}: Props) {
  const { theme } = useAppTheme();
  const isFocused = useIsFocused();
  const scrollRef = useRef<ScrollView | null>(null);
  const { isCompactPhone, contentMaxWidth: responsiveContentMaxWidth } = useResponsiveLayout();

  const sharedStyle: ViewStyle = {
    alignSelf: 'center',
    flexGrow: 1,
    maxWidth: contentMaxWidth ?? responsiveContentMaxWidth,
    paddingHorizontal: isCompactPhone ? theme.spacing.lg : theme.spacing.xl,
    paddingVertical: isCompactPhone ? theme.spacing.xl : theme.spacing.xxl,
    backgroundColor: theme.colors.background,
    width: '100%',
  };

  useEffect(() => {
    if (scroll && isFocused) {
      scrollRef.current?.scrollTo({ animated: false, y: 0 });
    }
  }, [isFocused, scroll]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.safeArea}>
        {scroll ? (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[sharedStyle, contentContainerStyle]}
            contentInsetAdjustmentBehavior="automatic"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          <View style={[sharedStyle, contentContainerStyle]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
