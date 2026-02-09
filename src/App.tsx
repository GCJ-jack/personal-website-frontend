import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./app/admin/AdminLayout";
import { AdminAuthProvider } from "./app/admin/auth/AdminAuthContext";
import { AdminProtectedRoute } from "./app/admin/auth/AdminProtectedRoute";
import { RootLayout } from "./app/layout/RootLayout";
import { site } from "./data/site";
import { AdminHomePage } from "./pages/Admin/AdminHomePage";
import { AdminLoginPage } from "./pages/Admin/AdminLoginPage";
import { AdminContentPage } from "./pages/Admin/AdminContentPage";
import { AdminSectionPage } from "./pages/Admin/AdminSectionPage";
import { BlogPage } from "./pages/Blog/BlogPage";
import { HomePage } from "./pages/Home/HomePage";
import { LivePage } from "./pages/Live/LivePage";
import { ProjectsPage } from "./pages/Projects/ProjectsPage";
import { StudyPage } from "./pages/Study/StudyPage";

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          <Route element={<RootLayout title={site.title} description={site.description} />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/live" element={<LivePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/study" element={<StudyPage />} />
          </Route>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={(
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            )}
          >
            <Route index element={<AdminHomePage />} />
            <Route
              path="content"
              element={<AdminContentPage />}
            />
            <Route
              path="media"
              element={(
                <AdminSectionPage
                  title="Media"
                  summary="Manage uploads and organize your asset library."
                  bullets={[
                    "Upload new images or files.",
                    "Refresh cover art and thumbnails.",
                    "Review storage usage and clean up.",
                  ]}
                />
              )}
            />
            <Route
              path="settings"
              element={(
                <AdminSectionPage
                  title="Settings"
                  summary="Tune the site configuration and user access."
                  bullets={[
                    "Update site metadata and social cards.",
                    "Manage roles and permissions.",
                    "Configure integrations and webhooks.",
                  ]}
                />
              )}
            />
          </Route>
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;
