import Svg, { Path } from 'react-native-svg';

import { useAppTheme } from '@/src/theme/useAppTheme';

export function DentliMark({ size = 72 }: { size?: number }) {
  const { theme } = useAppTheme();

  return (
    <Svg fill="none" height={size} viewBox="0 0 64 64" width={size}>
      <Path
        d="M22 9c-6.8 0-12 5.4-12 12.5 0 9.9 5 17.1 8.9 24.8 1.3 2.7 2.6 6.3 5.8 6.3 2.7 0 3.8-2.1 4.5-5.4l.9-4.3c.4-1.7 1-2.9 2-2.9s1.6 1.2 2 2.9l.9 4.3c.7 3.3 1.8 5.4 4.5 5.4 3.2 0 4.5-3.6 5.8-6.3C49 38.6 54 31.4 54 21.5 54 14.4 48.8 9 42 9c-3.2 0-5.9 1.3-8 3.4-2.1-2.1-4.8-3.4-8-3.4Z"
        stroke={theme.colors.primary}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
      />
      <Path
        d="M47.5 14.5 48.7 17l2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4 1.2-2.5Z"
        fill={theme.colors.accent}
      />
    </Svg>
  );
}
