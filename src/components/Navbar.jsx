import { Link, useNavigate } from 'react-router-dom';
import { Wrench, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Wrench className="h-4 w-4" />
          </span>
          <span>Maintenance Tracker</span>
        </Link>

        {user && (
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-sm text-slate-600 sm:inline-flex">
              <User className="h-4 w-4" />
              {user.displayName || user.email}
            </span>
            <button onClick={handleLogout} className="btn-secondary">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
