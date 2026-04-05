import { useCallback, useState } from 'react';

export function useDraftState<T>(createInitialState: () => T) {
  const [draft, setDraft] = useState<T>(() => createInitialState());

  const resetDraft = useCallback(() => {
    setDraft(createInitialState());
  }, [createInitialState]);

  const patchDraft = useCallback((patch: Partial<T>) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

  return {
    draft,
    setDraft,
    patchDraft,
    resetDraft,
  };
}
