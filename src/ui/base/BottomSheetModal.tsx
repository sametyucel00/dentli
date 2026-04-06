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
  const isCompactWidth = width < 390;

  return (
    <Modal animationType="slide" statusBarTranslucent transparent visible={visible}>
      <Pressable
        accessibilityLabel="Close sheet"
        accessibilityRole="button"
        accessible={false}
        onPress={onClose}
        style={{ backgroundColor: 'rgba(0,0,0,0.25)', flex: 1, justifyContent: 'flex-end' }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ justifyContent: 'flex-end' }}>
          <Pressable
            accessibilityViewIsModal
            onPress={() => undefined}
            style={{
              alignSelf: 'center',
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radii.lg,
              borderTopRightRadius: theme.radii.lg,
              minHeight,
              maxHeight: height * 0.84,
              paddingHorizontal: isCompactWidth ? theme.spacing.lg : theme.spacing.xl,
              paddingTop: theme.spacing.md,
              paddingBottom: theme.spacing.xl + insets.bottom,
              width: '100%',
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
