import { PropsWithChildren } from 'react';
import { Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
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
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <Pressable
        accessibilityLabel="Close sheet"
        accessibilityRole="button"
        accessible={false}
        onPress={onClose}
        style={{ backgroundColor: 'rgba(0,0,0,0.25)', flex: 1, justifyContent: 'flex-end' }}>
        <Pressable
          accessibilityViewIsModal
          onPress={() => undefined}
          style={{
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: theme.radii.lg,
            borderTopRightRadius: theme.radii.lg,
            minHeight,
            maxHeight: height * 0.84,
            paddingHorizontal: theme.spacing.xl,
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.xl + insets.bottom,
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
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
