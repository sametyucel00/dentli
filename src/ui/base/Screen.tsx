import { PropsWithChildren, useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/src/theme/useAppTheme';

type Props = PropsWithChildren<{
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}>;

export function Screen({
  children,
  scroll = true,
  contentContainerStyle,
}: Props) {
  const { theme } = useAppTheme();
  const isFocused = useIsFocused();
  const scrollRef = useRef<ScrollView | null>(null);
  const { width } = useWindowDimensions();
  const isCompactWidth = width < 390;
  const isWidePhone = width >= 430;

  const sharedStyle: ViewStyle = {
    alignSelf: 'center',
    flexGrow: 1,
    maxWidth: isWidePhone ? 560 : undefined,
    paddingHorizontal: isCompactWidth ? theme.spacing.lg : theme.spacing.xl,
    paddingVertical: isCompactWidth ? theme.spacing.xl : theme.spacing.xxl,
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
