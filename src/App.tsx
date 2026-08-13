import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { SplashScreen } from './components/SplashScreen';
import { Landing } from './pages/Landing';
import { DirectorDashboard } from './pages/admin/DirectorDashboard';
import { Gestion } from './pages/gestion/Gestion';
import { StudentHome } from './pages/student/StudentHome';
import { Enrollment } from './pages/enrollment/Enrollment';
import { Classes } from './pages/classes/Classes';
import { BlogList } from './pages/blog/BlogList';
import { BlogPost } from './pages/blog/BlogPost';
import { Events } from './pages/events/Events';

/**
 * The role-separated product moments plus the public marketing pages, one
 * shell. The catch-all redirect exists so there is no dead end in the demo:
 * any unknown path lands back on the landing page instead of Netlify's 404.
 *
 * The route separation here (/student, /gestion, /admin) is navigational
 * convenience only, same as `RoleSwitcher` — hidden navigation is not
 * authorization. Real role enforcement is a backend concern, not built yet.
 */
function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Landing />} />
            <Route path="/clases" element={<Classes />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/eventos" element={<Events />} />
            <Route path="/admin" element={<DirectorDashboard />} />
            <Route path="/gestion" element={<Gestion />} />
            <Route path="/reception" element={<Navigate to="/gestion" replace />} />
            <Route path="/student" element={<StudentHome />} />
            <Route path="/inscripcion" element={<Enrollment />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
