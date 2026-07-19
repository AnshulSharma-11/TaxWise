import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Landmark, LayoutDashboard, History, Calculator, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './TopNav.css';

const guestLinks = [{ to: '/calculator', label: 'Calculator', icon: Calculator }];

const authLinks = [
  { to: '/calculator', label: 'Calculator', icon: Calculator },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/history', label: 'History', icon: History },
];

export default function TopNav() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [isAuthenticated]);

  const links = isAuthenticated ? authLinks : guestLinks;
  const initials = (user?.fullName || '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  function handleLogout() {
    logout();
    setOpen(false);
    navigate('/');
  }

  return (
    <header className="topnav">
      <div className="container topnav-inner">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            <Landmark size={18} strokeWidth={2.25} />
          </span>
          <span className="brand-word">
            Tax<em>Wise</em>
          </span>
        </NavLink>

        <nav className={`topnav-links ${open ? 'is-open' : ''}`} aria-label="Primary">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `topnav-link ${isActive ? 'is-active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={16} strokeWidth={2.25} />
              {label}
            </NavLink>
          ))}

          <div className="topnav-links-divider" />

          {isAuthenticated ? (
            <div className="topnav-user-group">
              <NavLink to="/profile" className="topnav-user" onClick={() => setOpen(false)}>
                <span className="topnav-avatar">{initials || <UserRound size={14} />}</span>
                <span>{user?.fullName?.split(' ')[0] || 'Account'}</span>
              </NavLink>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                <LogOut size={15} strokeWidth={2.25} />
                Log out
              </button>
            </div>
          ) : (
            <div className="topnav-auth-group">
              <NavLink to="/login" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
                Log in
              </NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
                Get started
              </NavLink>
            </div>
          )}
        </nav>

        <button
          type="button"
          className="topnav-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}
