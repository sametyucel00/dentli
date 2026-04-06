import { PropsWithChildren } from 'react';
import {
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
  const { isCompactPhone, isShortScreen, isTablet, modalMaxWidth } = useResponsiveLayout();
  const horizontalPadding = isCompactPhone ? theme.spacing.lg : theme.spacing.xl;
  const bottomPadding = Math.max(theme.spacing.lg, insets.bottom + theme.spacing.md);
  const maxSheetHeight = height * (isShortScreen ? 0.9 : isTablet ? 0.82 : 0.84);
  const sheetWidth = isTablet ? Math.min(width - theme.spacing.xxxxl * 2, modalMaxWidth ?? 680) : width;
  const modalJustifyContent = isTablet ? 'center' : 'flex-end';

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
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
          style={{ justifyContent: modalJustifyContent }}>
          <Pressable
            accessibilityViewIsModal
            onPress={() => undefined}
            style={{
              alignSelf: 'center',
              backgroundColor: theme.colors.surface,
              borderRadius: isTablet ? theme.radii.xl : 0,
              borderTopLeftRadius: isTablet ? theme.radii.xl : theme.radii.lg,
              borderTopRightRadius: isTablet ? theme.radii.xl : theme.radii.lg,
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
              bounces={false}
              contentContainerStyle={{ paddingBottom: theme.spacing.sm }}
              contentInsetAdjustmentBehavior="automatic"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
