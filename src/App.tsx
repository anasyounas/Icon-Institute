import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ExpertiseHubPage } from './pages/ExpertiseAreaPage';
import { ExpertiseDetailPage } from './pages/ExpertiseDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectRegionPage } from './pages/ProjectRegionPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { NewsPage } from './pages/NewsPage';
import { NewsDetailPage } from './pages/NewsDetailPage';
import { JobsPage } from './pages/JobsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { JobApplyPage } from './pages/JobApplyPage';
import {
  DownloadPage,
  InformationMaterialPage,
  VideosPage,
} from './pages/DownloadPage';
import { ContactPage } from './pages/ContactPage';
import { ImpressumPage, PrivacyPage } from './pages/LegalPages';
import { AuthProvider } from './hooks/useAuth';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
// Every CMS module runs against the live backend API.
import { ContentMediaPage } from './pages/admin/ContentMediaPage';
import { NewsManagerPage } from './pages/admin/NewsManagerPage';
import { JobsManagerPage } from './pages/admin/JobsManagerPage';
import { ProjectsManagerPage } from './pages/admin/ProjectsManagerPage';
import { ContactInfoPage } from './pages/admin/ContactInfoPage';
import { MediaLibraryPage } from './pages/admin/MediaLibraryPage';
import { SeoManagerPage } from './pages/admin/SeoManagerPage';
import {
  BackupsPage,
  DraftPreviewPage,
  PublishPage,
  ScheduledPage,
  VersionHistoryPage,
  WorkflowPage,
} from './pages/admin/SystemPages';
import { UsersRolesPage } from './pages/admin/UsersRolesPage';
import { SecurityPage } from './pages/admin/SecurityPage';
import { AuditLogPage } from './pages/admin/AuditLogPage';
import './index.css';

/** `/refprojects/<slug>` was the old project permalink; keep those links alive. */
function LegacyProjectRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/projects/detail/${slug}`} replace />;
}

/** Legacy WordPress-style expertise paths → new SPA routes */
const expertiseRedirects: Record<string, string> = {
  'statistics-evaluation-and-social-research':
    '/expertise/statistics-evaluation-social-research',
  'economic-and-employment-promotion':
    '/expertise/economic-employment-promotion',
  'governance-education-and-social-development':
    '/expertise/governance-education-social-development',
  'agriculture-and-rural-development':
    '/expertise/agriculture-rural-development',
  'sustainability-management': '/expertise/sustainability-management',
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="content" element={<ContentMediaPage />} />
            <Route path="news" element={<NewsManagerPage />} />
            <Route path="jobs" element={<JobsManagerPage />} />
            <Route path="projects" element={<ProjectsManagerPage />} />
            <Route path="contact" element={<ContactInfoPage />} />
            <Route path="media" element={<MediaLibraryPage />} />
            <Route path="seo" element={<SeoManagerPage />} />
            <Route path="drafts" element={<DraftPreviewPage />} />
            <Route path="workflow" element={<WorkflowPage />} />
            <Route path="versions" element={<VersionHistoryPage />} />
            <Route path="schedule" element={<ScheduledPage />} />
            <Route path="publish" element={<PublishPage />} />
            <Route path="users" element={<UsersRolesPage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="audit" element={<AuditLogPage />} />
            <Route path="backups" element={<BackupsPage />} />
          </Route>

          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about-us" element={<AboutPage />} />
            <Route path="expertise" element={<ExpertiseHubPage />} />
            <Route path="expertise/:slug" element={<ExpertiseDetailPage />} />
            {Object.entries(expertiseRedirects).map(([from, to]) => (
              <Route
                key={from}
                path={from}
                element={<Navigate to={to} replace />}
              />
            ))}
            <Route path="projects" element={<ProjectsPage />} />
            {/* Detail sits under its own segment so project slugs can never
                collide with the six region slugs. */}
            <Route path="projects/detail/:slug" element={<ProjectDetailPage />} />
            <Route path="projects/:region" element={<ProjectRegionPage />} />
            {/* Legacy WordPress project permalinks → the new detail route */}
            <Route path="refprojects/:slug" element={<LegacyProjectRedirect />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="news/:slug" element={<NewsDetailPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="jobs/:jobId" element={<JobDetailPage />} />
            <Route path="jobs/:jobId/apply" element={<JobApplyPage />} />
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
    </AuthProvider>
  );
}
