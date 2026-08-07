import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ExpertiseHubPage } from './pages/ExpertiseAreaPage';
import { ExpertiseDetailPage } from './pages/ExpertiseDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectRegionPage } from './pages/ProjectRegionPage';
import { NewsPage } from './pages/NewsPage';
import { NewsDetailPage } from './pages/NewsDetailPage';
import { JobsPage } from './pages/JobsPage';
import {
  DownloadPage,
  InformationMaterialPage,
  VideosPage,
} from './pages/DownloadPage';
import { ContactPage } from './pages/ContactPage';
import { ImpressumPage, PrivacyPage } from './pages/LegalPages';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about-us" element={<AboutPage />} />
          <Route path="expertise" element={<ExpertiseHubPage />} />
          <Route path="expertise/:slug" element={<ExpertiseDetailPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:region" element={<ProjectRegionPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="news/:slug" element={<NewsDetailPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="download" element={<DownloadPage />} />
          <Route
            path="download/information-material"
            element={<InformationMaterialPage />}
          />
          <Route path="download/videos" element={<VideosPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy-policy" element={<PrivacyPage />} />
          <Route path="impressum" element={<ImpressumPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
