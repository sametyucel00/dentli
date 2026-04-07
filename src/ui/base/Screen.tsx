import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
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

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
        style={styles.safeArea}>
        {scroll ? (
          <ScrollView
            ref={scrollRef}
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={[
              sharedStyle,
              {
                paddingBottom:
                  (isCompactPhone ? theme.spacing.xl : theme.spacing.xxl) +
                  keyboardHeight +
                  theme.spacing.lg,
              },
              contentContainerStyle,
            ]}
            contentInsetAdjustmentBehavior="automatic"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled
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
