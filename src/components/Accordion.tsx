import { useState, type ReactNode } from 'react';

type Item = {
  id: string;
  title: string;
  children: ReactNode;
};

type Props = {
  items: Item[];
  allowMultiple?: boolean;
};

export function Accordion({ items, allowMultiple = false }: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="accordion">
      {items.map((item) => {
        const isOpen = open.has(item.id);
        return (
          <div
            key={item.id}
            className={`accordion__item ${isOpen ? 'is-open' : ''}`}
          >
            <button
              type="button"
              className="accordion__header"
              aria-expanded={isOpen}
              onClick={() => toggle(item.id)}
            >
              <span>{item.title}</span>
              <span className="accordion__icon" aria-hidden>
                {isOpen ? '−' : '+'}
              </span>
            </button>
            {isOpen && <div className="accordion__body">{item.children}</div>}
          </div>
        );
      })}
    </div>
  );
}
