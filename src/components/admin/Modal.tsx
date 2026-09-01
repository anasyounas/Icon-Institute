import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type FormEvent,
  type ReactNode,
} from 'react';

/**
 * The dialog every CMS editor opens in.
 *
 * Editing used to expand a form inline, which pushed the table down the page
 * and left no clear way out. A dialog keeps the list in place, states what is
 * being edited, and always offers a way to close — Escape, the backdrop, or
 * the header button.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  title,
  subtitle,
  badge,
  onClose,
  children,
  footer,
  size = 'medium',
  /** Wraps the body in a form so Enter submits and the footer can submit it. */
  onSubmit,
  busy = false,
}: {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'medium' | 'large';
  onSubmit?: (e: FormEvent) => void;
  busy?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const restoreFocus = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  /** Closing mid-save would leave the user unsure whether it completed. */
  const requestClose = useCallback(() => {
    if (!busy) onCloseRef.current();
  }, [busy]);

  useEffect(() => {
    restoreFocus.current = document.activeElement as HTMLElement | null;

    // The page behind must not scroll while a dialog is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const first = cardRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        requestClose();
        return;
      }
      if (event.key !== 'Tab') return;

      // Keep Tab inside the dialog.
      const items = Array.from(
        cardRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []
      ).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;

      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      restoreFocus.current?.focus?.();
    };
  }, [requestClose]);

  const body = (
    <>
      <header className="cms-modal__head">
        <div className="cms-modal__heading">
          <h2 id={titleId}>{title}</h2>
          {subtitle && <p className="cms-modal__sub">{subtitle}</p>}
        </div>
        {badge}
        <button
          type="button"
          className="cms-modal__close"
          onClick={requestClose}
          disabled={busy}
          aria-label="Close"
          title="Close (Esc)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="m6 6 12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      <div className="cms-modal__body">{children}</div>

      {footer && <footer className="cms-modal__foot">{footer}</footer>}
    </>
  );

  return (
    <div
      className="cms-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(e) => {
        // Only a click that starts on the backdrop closes: dragging a text
        // selection out of the dialog must not dismiss it.
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        ref={cardRef}
        className={`cms-modal__card cms-modal__card--${size}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {onSubmit ? (
          <form className="cms-modal__form" onSubmit={onSubmit} noValidate={false}>
            {body}
          </form>
        ) : (
          body
        )}
      </div>
    </div>
  );
}

/** Groups fields under a heading inside a dialog. */
export function FormSection({
  title,
  hint,
  children,
  full = false,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <section className={`cms-form-section ${full ? 'is-full' : ''}`}>
      <header>
        <h3>{title}</h3>
        {hint && <p>{hint}</p>}
      </header>
      <div className="cms-form-grid">{children}</div>
    </section>
  );
}

/**
 * A field that spans both columns — long text, paragraph lists and anything
 * with a picker beside it.
 */
export function Wide({ children }: { children: ReactNode }) {
  return <div className="cms-field-wide">{children}</div>;
}
