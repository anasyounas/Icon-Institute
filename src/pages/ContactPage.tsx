import { contactPage as bundledContact, type ContactPage as ContactData } from '../data/contact';
import { PageHero } from '../components/PageHero';
import { Seo } from '../components/Seo';
import { pageSeo } from '../data/seo';
import { usePublished } from '../hooks/usePublished';

export function ContactPage() {
  // Contact details are maintained in the CMS (Contact Information module).
  const contactPage = usePublished<ContactData>('/contact', bundledContact);
  const { company } = contactPage;

  return (
    <div className="contact-page">
      <Seo {...pageSeo.contact} />
      <PageHero title="CONTACT US" compact imageAlt="Contact ICON-INSTITUTE" />
      <section className="content-section">
        <div className="container contact-page__grid">
          <div>
            <h2>{contactPage.title}</h2>
            <p>{contactPage.intro}</p>
            <p>{contactPage.howToReach}</p>

            <dl className="contact-details">
              <div>
                <dt>Address</dt>
                <dd>
                  <address>
                    {company.name}
                    <br />
                    {company.addressLines.map((line) => (
                      <span key={line}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </address>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${company.phone.replace(/\s/g, '')}`}>
                    {company.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Fax</dt>
                <dd>{company.fax}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${company.email}`}>{company.email}</a>
                </dd>
              </div>
              <div>
                <dt>Website</dt>
                <dd>
                  <a
                    href={company.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {company.website}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <aside className="contact-page__aside" aria-labelledby="dept-heading">
            <h3 id="dept-heading">Departments</h3>
            <ul className="contact-depts">
              {contactPage.departments.map((d) => (
                <li key={d.email}>
                  <strong>{d.label}</strong>
                  <br />
                  <a href={`mailto:${d.email}`}>{d.email}</a>
                </li>
              ))}
            </ul>
            <p className="muted">
              Contact details are maintained through the local CMS. There is no
              public contact form on this site.
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}
