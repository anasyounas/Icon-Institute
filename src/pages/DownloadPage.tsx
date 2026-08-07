import { Link } from 'react-router-dom';
import { downloadPage } from '../data/download';
import { PageHero } from '../components/PageHero';
import { Seo } from '../components/Seo';
import { pageSeo } from '../data/seo';

export function DownloadPage() {
  return (
    <div className="download-page">
      <Seo {...pageSeo.download} />
      <PageHero title="DOWNLOAD" compact />
      <section className="content-section">
        <div className="container download-page__grid">
          <article>
            <h2>{downloadPage.informationMaterial.title}</h2>
            <p>{downloadPage.informationMaterial.intro}</p>
            <Link
              to="/download/information-material"
              className="btn btn--primary"
            >
              Browse information material
            </Link>
          </article>
          <article>
            <h2>{downloadPage.videos.title}</h2>
            <p>{downloadPage.videos.intro}</p>
            <Link to="/download/videos" className="btn btn--primary">
              Browse videos
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
      <Seo
        title={`Information Material | ICON-INSTITUTE`}
        description={informationMaterial.intro}
        path="/download/information-material"
      />
      <PageHero title="INFORMATION MATERIAL" compact />
      <section className="content-section">
        <div className="container narrow">
          <h2>Brochures and Flyers</h2>
          <p>{informationMaterial.intro}</p>
          <ul className="download-list">
            {informationMaterial.materials.map((m) => {
              const file = m.file ?? 'file-placeholder.pdf';
              return (
                <li key={m.title}>
                  <div>
                    <strong>{m.title}</strong>
                    {m.description && <p>{m.description}</p>}
                  </div>
                  <a
                    className="download-list__file"
                    href={`/downloads/${file}`}
                    download
                  >
                    Download {file}
                  </a>
                </li>
              );
            })}
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
      <Seo
        title={`Videos | ICON-INSTITUTE`}
        description={videos.intro}
        path="/download/videos"
      />
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
