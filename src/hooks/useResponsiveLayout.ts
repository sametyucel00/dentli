import { useWindowDimensions } from 'react-native';

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();

  const isCompactPhone = width < 390;
  const isPhone = width < 600;
  const isLargePhone = width >= 430 && width < 700;
  const isTablet = width >= 700;
  const isExpanded = width >= 960;
  const isShortScreen = height < 760;

  const contentMaxWidth = isExpanded ? 1120 : isTablet ? 920 : isLargePhone ? 620 : undefined;
  const readingMaxWidth = isExpanded ? 980 : isTablet ? 820 : isLargePhone ? 600 : undefined;
  const formMaxWidth = isExpanded ? 760 : isTablet ? 700 : undefined;
  const modalMaxWidth = isExpanded ? 760 : isTablet ? 680 : undefined;

  return {
    width,
    height,
    isCompactPhone,
    isPhone,
    isLargePhone,
    isTablet,
    isExpanded,
    isShortScreen,
    contentMaxWidth,
    readingMaxWidth,
    formMaxWidth,
    modalMaxWidth,
  };
}
