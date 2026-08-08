/**
 * Lightweight admin toasts: success/info notices and confirm dialogs that
 * replace native window.confirm without adding a dependency.
 */

import { useEffect, useState } from 'react';

type ToastKind = 'success' | 'error' | 'confirm';

type ToastEntry = {
  id: number;
  kind: ToastKind;
  message: string;
  resolve?: (ok: boolean) => void;
};

type Listener = (entries: ToastEntry[]) => void;

let nextId = 1;
let entries: ToastEntry[] = [];
const listeners = new Set<Listener>();

function emit() {
  const snapshot = entries.slice();
  listeners.forEach((l) => l(snapshot));
}

function push(entry: Omit<ToastEntry, 'id'>): number {
  const id = nextId++;
  entries = [...entries, { ...entry, id }];
  emit();
  return id;
}

function remove(id: number) {
  entries = entries.filter((e) => e.id !== id);
  emit();
}

/** Show a short success/info toast that auto-dismisses. */
export function showToast(message: string, kind: 'success' | 'error' = 'success') {
  const id = push({ kind, message });
  window.setTimeout(() => remove(id), 3800);
}

/** Confirm via an in-app toast instead of window.confirm. */
export function confirmToast(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    push({ kind: 'confirm', message, resolve });
  });
}

function answer(entry: ToastEntry, ok: boolean) {
  entry.resolve?.(ok);
  remove(entry.id);
}

export function ToastHost() {
  const [items, setItems] = useState<ToastEntry[]>(entries);

  useEffect(() => {
    const listener: Listener = setItems;
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="admin-toast-host" aria-live="polite">
      {items.map((item) => (
        <div
          key={item.id}
          className={`admin-toast admin-toast--${item.kind}`}
          role={item.kind === 'confirm' ? 'alertdialog' : 'status'}
        >
          <p className="admin-toast__msg">{item.message}</p>
          {item.kind === 'confirm' ? (
            <div className="admin-toast__actions">
              <button
                type="button"
                className="btn btn--light"
                onClick={() => answer(item, false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => answer(item, true)}
              >
                Delete
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="admin-toast__close"
              aria-label="Dismiss"
              onClick={() => remove(item.id)}
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
