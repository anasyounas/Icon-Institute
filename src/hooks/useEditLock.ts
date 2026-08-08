import { useCallback, useEffect, useRef, useState } from 'react';

export type EditLockState = 'locked' | 'editing' | 'saved';

/**
 * Read-only-by-default form behaviour.
 *
 * locked  → fields disabled, only "Edit" is offered
 * editing → fields enabled, "Save changes" + "Cancel" offered
 * saved   → brief confirmation, then straight back to locked
 *
 * Nothing here persists: the CMS is a frontend demo, so "saving" only returns
 * the form to its locked state.
 */
export function useEditLock() {
  const [state, setState] = useState<EditLockState>('locked');
  const timer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    []
  );

  const edit = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    setState('editing');
  }, []);

  const cancel = useCallback(() => setState('locked'), []);

  const save = useCallback(() => {
    setState('saved');
    timer.current = window.setTimeout(() => setState('locked'), 2200);
  }, []);

  return {
    state,
    /** Fields are only interactive while editing. */
    isEditing: state === 'editing',
    disabled: state !== 'editing',
    edit,
    cancel,
    save,
  };
}
