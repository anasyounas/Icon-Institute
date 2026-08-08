import { Link } from 'react-router-dom';
import { downloadPage as bundledDownload, type DownloadPage as DownloadData } from '../data/download';
import { PageHero } from '../components/PageHero';
import { Seo } from '../components/Seo';
import { pageSeo } from '../data/seo';
import { usePublished } from '../hooks/usePublished';
import { assetUrl } from '../lib/api';
import { DownloadIcon } from '../components/Icons';

export function DownloadPage() {
  const downloadPage = usePublished<DownloadData>('/pages/download', bundledDownload);
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
  const downloadPage = usePublished<DownloadData>('/pages/download', bundledDownload);
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
              // Documents uploaded through the CMS live under /media/ on the
              // institute's own server; absolute URLs are used as given.
              const file = m.file ?? '';
              const href = /^https?:/.test(file)
                ? file
                : file.startsWith('/media/')
                  ? assetUrl(file)
                  : '';

              return (
                <li key={m.title}>
                  <div>
                    <strong>{m.title}</strong>
                    {m.description && <p>{m.description}</p>}
                  </div>
                  {href ? (
                    <a className="download-list__file" href={href} download>
                      <DownloadIcon className="btn__icon" aria-hidden="true" />
                      Download PDF
                    </a>
                  ) : (
                    // Nothing uploaded yet — say so rather than offer a dead link.
                    <span className="download-list__pending">Document coming soon</span>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="back-link">
            <Link to="/download">← Download</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export function VideosPage() {
  const downloadPage = usePublished<DownloadData>('/pages/download', bundledDownload);
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
