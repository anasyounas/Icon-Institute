import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { contactPage } from '../data/contact';
import { PageHero } from '../components/PageHero';

export function ContactPage() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="contact-page">
      <PageHero title="CONTACT US" compact />
      <section className="content-section">
        <div className="container contact-page__grid">
          <div>
            <h2>{contactPage.title}</h2>
            <p>
              {contactPage.privacyNote}{' '}
              <Link to="/privacy-policy">privacy policy</Link>.
            </p>
            <p>{contactPage.captchaNote}</p>
            <p className="muted">{contactPage.captchaNoteDe}</p>

            {sent ? (
              <p className="status-box">
                Thank you. This demo form does not send messages — connect a
                backend or email service when ready.
              </p>
            ) : (
              <form className="contact-form" onSubmit={onSubmit}>
                {contactPage.fields.map((field) => (
                  <label key={field.name}>
                    {field.label}
                    {field.type === 'textarea' ? (
                      <textarea
                        name={field.name}
                        required={field.required}
                        rows={6}
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        required={field.required}
                      />
                    )}
                  </label>
                ))}
                <fieldset className="contact-form__captcha">
                  <legend>Anti-spam</legend>
                  <label>
                    <input type="radio" name="captcha" value="house" required />{' '}
                    Haus / House
                  </label>
                  <label>
                    <input type="radio" name="captcha" value="car" /> Auto / Car
                  </label>
                  <label>
                    <input type="radio" name="captcha" value="truck" /> LKW /
                    Truck
                  </label>
                </fieldset>
                <button type="submit" className="btn btn--primary">
                  Send
                </button>
              </form>
            )}
          </div>

          <aside className="contact-page__aside">
            <h3>{contactPage.company.name}</h3>
            {contactPage.company.addressLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
            <p>
              <a href={`tel:${contactPage.company.phone.replace(/\s/g, '')}`}>
                {contactPage.company.phone}
              </a>
              <br />
              Fax: {contactPage.company.fax}
              <br />
              <a href={`mailto:${contactPage.company.email}`}>
                {contactPage.company.email}
              </a>
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}
