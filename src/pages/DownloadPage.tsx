import { Link } from 'react-router-dom';
import { downloadPage } from '../data/download';
import { PageHero } from '../components/PageHero';

export function DownloadPage() {
  return (
    <div className="download-page">
      <PageHero title="DOWNLOAD" compact />
      <section className="content-section">
        <div className="container download-page__grid">
          <article>
            <h2>{downloadPage.informationMaterial.title}</h2>
            <p>{downloadPage.informationMaterial.intro}</p>
            <Link to="/download/information-material" className="btn btn--primary">
              Read more
            </Link>
          </article>
          <article>
            <h2>{downloadPage.videos.title}</h2>
            <p>{downloadPage.videos.intro}</p>
            <Link to="/download/videos" className="btn btn--primary">
              Read more
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}

export function InformationMaterialPage() {
  const { informationMaterial } = downloadPage;
  return (
    <div>
      <PageHero title="INFORMATION MATERIAL" compact />
      <section className="content-section">
        <div className="container narrow">
          <h2>Brochures and Flyers</h2>
          <p>{informationMaterial.intro}</p>
          <ul className="download-list">
            {informationMaterial.materials.map((m) => (
              <li key={m.title}>
                <div>
                  <strong>{m.title}</strong>
                  {m.description && <p>{m.description}</p>}
                </div>
                <span className="download-list__file">
                  {m.file ?? 'file-placeholder.pdf'}
                </span>
              </li>
            ))}
          </ul>
          <p className="muted">
            Place PDF files in <code>public/downloads/</code> using the filenames
            shown above.
          </p>
          <p className="back-link">
            <Link to="/download">← Download</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export function VideosPage() {
  const { videos } = downloadPage;
  return (
    <div>
      <PageHero title="VIDEOS" compact />
      <section className="content-section">
        <div className="container narrow">
          <p>{videos.intro}</p>
          <p className="status-box">{videos.status}</p>
          <p className="back-link">
            <Link to="/download">← Download</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
