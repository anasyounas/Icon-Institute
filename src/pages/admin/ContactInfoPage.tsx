import { useEffect, useState, type FormEvent } from 'react';
import { errorText, formatWhen } from '../../components/admin/cms';
import { useAuth } from '../../hooks/useAuth';
import { api, type PageDetail } from '../../lib/api';

type ContactData = {
  title: string;
  intro: string;
  howToReach: string;
  company: {
    name: string;
    addressLines: string[];
    phone: string;
    fax: string;
    email: string;
    website: string;
    websiteUrl: string;
  };
  departments: { label: string; email: string }[];
};

export function ContactInfoPage() {
  const { can } = useAuth();
  const [detail, setDetail] = useState<PageDetail | null>(null);
  const [data, setData] = useState<ContactData | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.pages
      .get('contact')
      .then((d) => {
        if (cancelled) return;
        setDetail(d);
        setData(d.draft as unknown as ContactData);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorText(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const edit = (updater: (draft: ContactData) => ContactData) => {
    setData((current) => (current ? updater(current) : current));
    setDirty(true);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setBusy(true);
    setError('');
    try {
      const saved = await api.pages.saveDraft('contact', data as unknown as Record<string, unknown>);
      setDetail(saved);
      setDirty(false);
      setNotice('Draft saved. Publish to update the website.');
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const publish = async () => {
    if (!data) return;
    setBusy(true);
    setError('');
    try {
      if (dirty) {
        await api.pages.saveDraft('contact', data as unknown as Record<string, unknown>);
      }
      const published = await api.pages.publish('contact');
      setDetail(published);
      setData(published.draft as unknown as ContactData);
      setDirty(false);
      setNotice('Published — the website now shows these contact details.');
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const hasUnpublished = dirty || (detail?.has_unpublished_changes ?? false);

  if (!data) {
    return (
      <div className="admin-page">
        <h1>Contact Information</h1>
        {error ? (
          <p className="admin-login__error" role="alert">
            {error}
          </p>
        ) : (
          <p className="admin-table__empty">Loading contact details…</p>
        )}
      </div>
    );
  }

  const company = data.company;

  return (
    <div className="admin-page">
      <h1>Contact Information</h1>
      <p className="admin-banner">
        The static contact details shown on the website — address, phone, fax
        and email — in place of the former public contact form.
      </p>

      {notice && (
        <p className="status-box" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="admin-login__error" role="alert">
          {error}
        </p>
      )}

      <form className="admin-form-card is-editing" onSubmit={save}>
        <header className="admin-form-card__head">
          <div>
            <h2>Company details</h2>
            {detail && (
              <p className="admin-panel-card__sub">
                v{detail.version} · last edited {formatWhen(detail.updated_at)}
                {hasUnpublished ? ' · unpublished changes' : ' · in sync with the site'}
              </p>
            )}
          </div>
        </header>

        <fieldset className="admin-form" disabled={busy || !can('content:write')}>
          <label>
            Company name
            <input
              type="text"
              required
              value={company.name}
              onChange={(e) =>
                edit((d) => ({ ...d, company: { ...d.company, name: e.target.value } }))
              }
            />
          </label>
          <label>
            Address
            <textarea
              rows={3}
              required
              value={company.addressLines.join('\n')}
              onChange={(e) =>
                edit((d) => ({
                  ...d,
                  company: { ...d.company, addressLines: e.target.value.split('\n') },
                }))
              }
            />
            <span className="field-hint">One line per address row (street, postcode/city, country).</span>
          </label>
          <label>
            Phone
            <input
              type="text"
              required
              value={company.phone}
              onChange={(e) =>
                edit((d) => ({ ...d, company: { ...d.company, phone: e.target.value } }))
              }
            />
          </label>
          <label>
            Fax
            <input
              type="text"
              value={company.fax}
              onChange={(e) =>
                edit((d) => ({ ...d, company: { ...d.company, fax: e.target.value } }))
              }
            />
          </label>
          <label>
            Email
            <input
              type="email"
              required
              value={company.email}
              onChange={(e) =>
                edit((d) => ({ ...d, company: { ...d.company, email: e.target.value } }))
              }
            />
          </label>
          <label>
            Website (display text)
            <input
              type="text"
              value={company.website}
              onChange={(e) =>
                edit((d) => ({ ...d, company: { ...d.company, website: e.target.value } }))
              }
            />
          </label>
          <label>
            Website URL
            <input
              type="url"
              value={company.websiteUrl}
              onChange={(e) =>
                edit((d) => ({ ...d, company: { ...d.company, websiteUrl: e.target.value } }))
              }
            />
          </label>
          <label>
            Page introduction
            <textarea
              rows={2}
              value={data.intro}
              onChange={(e) => edit((d) => ({ ...d, intro: e.target.value }))}
            />
          </label>
          <label>
            “How to reach us” text
            <textarea
              rows={3}
              value={data.howToReach}
              onChange={(e) => edit((d) => ({ ...d, howToReach: e.target.value }))}
            />
          </label>
        </fieldset>

        <h3 className="admin-subhead">Departments</h3>
        <fieldset className="admin-form" disabled={busy || !can('content:write')}>
          {data.departments.map((dept, index) => (
            <div key={index} className="admin-dept-row">
              <label>
                Label
                <input
                  type="text"
                  value={dept.label}
                  onChange={(e) =>
                    edit((d) => ({
                      ...d,
                      departments: d.departments.map((x, i) =>
                        i === index ? { ...x, label: e.target.value } : x
                      ),
                    }))
                  }
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={dept.email}
                  onChange={(e) =>
                    edit((d) => ({
                      ...d,
                      departments: d.departments.map((x, i) =>
                        i === index ? { ...x, email: e.target.value } : x
                      ),
                    }))
                  }
                />
              </label>
              <button
                type="button"
                className="row-action row-action--danger"
                onClick={() =>
                  edit((d) => ({
                    ...d,
                    departments: d.departments.filter((_, i) => i !== index),
                  }))
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn--light"
            onClick={() =>
              edit((d) => ({
                ...d,
                departments: [...d.departments, { label: '', email: '' }],
              }))
            }
          >
            Add department
          </button>
        </fieldset>

        <div className="admin-savebar">
          {can('content:write') && (
            <button type="submit" className="btn btn--primary" disabled={busy || !dirty}>
              {busy ? 'Working…' : 'Save draft'}
            </button>
          )}
          {can('publish:run') && (
            <button
              type="button"
              className="btn btn--primary"
              disabled={busy || !hasUnpublished}
              onClick={() => void publish()}
            >
              Publish to website
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
