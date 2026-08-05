import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { SplashScreen } from './components/SplashScreen';
import { Landing } from './pages/Landing';
import { DirectorDashboard } from './pages/admin/DirectorDashboard';
import { Reception } from './pages/reception/Reception';
import { StudentHome } from './pages/student/StudentHome';
import { CheckIn } from './pages/checkin/CheckIn';
import { Classes } from './pages/classes/Classes';
import { BlogList } from './pages/blog/BlogList';
import { BlogPost } from './pages/blog/BlogPost';
import { Events } from './pages/events/Events';

/**
 * The five product moments plus the public marketing pages, one shell. The
 * catch-all redirect exists so there is no dead end in the demo: any unknown
 * path lands back on the landing page instead of Netlify's 404.
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
            <Route path="/reception" element={<Reception />} />
            <Route path="/student" element={<StudentHome />} />
            <Route path="/checkin" element={<CheckIn />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
