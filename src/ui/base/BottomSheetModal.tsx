import { PropsWithChildren, useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';
import { useAppTheme } from '@/src/theme/useAppTheme';

type BottomSheetModalProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  minHeight?: number;
}>;

export function BottomSheetModal({
  children,
  visible,
  onClose,
  minHeight = 260,
}: BottomSheetModalProps) {
  const { theme } = useAppTheme();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { isCompactPhone, isShortScreen, isTablet, modalMaxWidth } = useResponsiveLayout();
  const horizontalPadding = isCompactPhone ? theme.spacing.lg : theme.spacing.xl;
  const bottomPadding = Math.max(theme.spacing.lg, insets.bottom + theme.spacing.md);
  const keyboardOffset = Platform.OS === 'android' ? Math.max(0, keyboardHeight - insets.bottom) : 0;
  const phoneMaxHeight = height - insets.top - theme.spacing.xl;
  const maxSheetHeight = Math.max(
    minHeight,
    isTablet
      ? height * (isShortScreen ? 0.9 : 0.82) - keyboardHeight * 0.35
      : phoneMaxHeight,
  );
  const sheetWidth = isTablet ? Math.min(width - theme.spacing.xxxxl * 2, modalMaxWidth ?? 680) : width;
  const modalJustifyContent = isTablet ? 'center' : 'flex-end';

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
    <Modal animationType="slide" statusBarTranslucent transparent visible={visible}>
      <Pressable
        accessibilityLabel="Close sheet"
        accessibilityRole="button"
        accessible={false}
        onPress={onClose}
        style={{
          backgroundColor: 'rgba(0,0,0,0.25)',
          flex: 1,
          justifyContent: modalJustifyContent,
          paddingHorizontal: isTablet ? theme.spacing.xl : 0,
        }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
          style={{ flex: 1, justifyContent: modalJustifyContent }}>
          <Pressable
            accessibilityViewIsModal
            onPress={() => undefined}
            style={{
              alignSelf: 'center',
              backgroundColor: theme.colors.surface,
              borderRadius: isTablet ? theme.radii.xl : 0,
              borderTopLeftRadius: isTablet ? theme.radii.xl : theme.radii.lg,
              borderTopRightRadius: isTablet ? theme.radii.xl : theme.radii.lg,
              marginBottom: isTablet ? 0 : keyboardOffset,
              minHeight,
              maxHeight: maxSheetHeight,
              paddingHorizontal: horizontalPadding,
              paddingTop: theme.spacing.md,
              paddingBottom: bottomPadding,
              width: sheetWidth,
            }}>
            <View
              style={{
                alignItems: 'center',
                marginBottom: theme.spacing.md,
              }}>
              <View
                style={{
                  backgroundColor: theme.colors.borderStrong,
                  borderRadius: theme.radii.pill,
                  height: 4,
                  width: 42,
                }}
              />
            </View>
            <ScrollView
              automaticallyAdjustKeyboardInsets
              bounces={false}
              contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: bottomPadding + theme.spacing.xl + keyboardHeight,
              }}
              contentInsetAdjustmentBehavior="automatic"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
