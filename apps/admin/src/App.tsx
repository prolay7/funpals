/**
 * App.tsx — Funpals Admin Panel root component.
 * Provides routing between admin pages and auth guard.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Activities from './pages/Activities';
import Posts from './pages/Posts';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Layout from './components/Layout';

function useAdminAuth() {
  return !!localStorage.getItem('adminToken');
}

export default function App() {
  const isAuthed = useAdminAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {isAuthed ? (
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="users"         element={<Users />} />
            <Route path="activities"    element={<Activities />} />
            <Route path="posts"         element={<Posts />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings"      element={<Settings />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}
