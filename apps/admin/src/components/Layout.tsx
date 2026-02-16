import { Outlet, NavLink } from 'react-router-dom';
const links = [
  { to: '/',             label: '📊 Dashboard' },
  { to: '/users',        label: '👥 Users' },
  { to: '/activities',   label: '🎯 Activities' },
  { to: '/posts',        label: '📝 Posts' },
  { to: '/notifications',label: '🔔 Notifications' },
  { to: '/settings',     label: '⚙️ Settings' },
];
export default function Layout() {
  return (
    <div className="flex h-screen">
      <nav className="w-56 bg-[#1A3C5E] text-white flex flex-col p-4 gap-1">
        <div className="text-xl font-bold mb-6 text-[#0E7F6B]">Funpals Admin</div>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'}
            className={({ isActive }) => `px-3 py-2 rounded text-sm ${isActive ? 'bg-[#0E7F6B] text-white' : 'hover:bg-blue-800'}`}>
            {l.label}
          </NavLink>
        ))}
        <button className="mt-auto px-3 py-2 rounded text-sm bg-red-700 hover:bg-red-600"
          onClick={() => { localStorage.removeItem('adminToken'); window.location.href='/login'; }}>
          Logout
        </button>
      </nav>
      <main className="flex-1 overflow-auto p-6"><Outlet /></main>
    </div>
  );
}
