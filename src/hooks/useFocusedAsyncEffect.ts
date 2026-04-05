import { useEffect } from 'react';

export function useFocusedAsyncEffect(
  isFocused: boolean,
  effect: () => Promise<void>,
) {
  useEffect(() => {
    if (!isFocused) {
      return;
    }

    void effect();
  }, [effect, isFocused]);
}
