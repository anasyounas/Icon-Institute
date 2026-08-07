import { impressum, privacyPolicy, type LegalPage } from '../data/legal';
import { PageHero } from '../components/PageHero';

function LegalContent({ page }: { page: LegalPage }) {
  return (
    <div>
      <PageHero title={page.title} compact />
      <section className="content-section">
        <div className="container narrow">
          {page.sections.map((section) => (
            <div key={section.title} className="legal-section">
              <h2>{section.title}</h2>
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 48)}>{p}</p>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function PrivacyPage() {
  return <LegalContent page={privacyPolicy} />;
}

export function ImpressumPage() {
  return <LegalContent page={impressum} />;
}
