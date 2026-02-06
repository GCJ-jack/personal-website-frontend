import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RootLayout } from "./app/layout/RootLayout";
import { site } from "./data/site";
import { BlogPage } from "./pages/Blog/BlogPage";
import { HomePage } from "./pages/Home/HomePage";
import { LivePage } from "./pages/Live/LivePage";
import { ProjectsPage } from "./pages/Projects/ProjectsPage";
import { StudyPage } from "./pages/Study/StudyPage";

function App() {
  return (
    <BrowserRouter>
      <RootLayout title={site.title} description={site.description}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/live" element={<LivePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/study" element={<StudyPage />} />
        </Routes>
      </RootLayout>
    </BrowserRouter>
  );
}

export default App;
