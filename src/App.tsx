import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { Landing } from './pages/Landing';
import { DirectorDashboard } from './pages/admin/DirectorDashboard';
import { Reception } from './pages/reception/Reception';
import { StudentHome } from './pages/student/StudentHome';
import { CheckIn } from './pages/checkin/CheckIn';

/**
 * Five product moments, one shell. The catch-all redirect exists so there is
 * no dead end in the demo: any unknown path lands back on the landing page
 * instead of Netlify's 404.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<DirectorDashboard />} />
          <Route path="/reception" element={<Reception />} />
          <Route path="/student" element={<StudentHome />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
