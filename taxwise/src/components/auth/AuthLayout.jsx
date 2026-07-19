import { NavLink } from 'react-router-dom';
import { Landmark, ShieldCheck, TrendingDown, History } from 'lucide-react';
import './AuthLayout.css';

const points = [
  { icon: ShieldCheck, text: 'Your data stays tied to your account only — never shared.' },
  { icon: TrendingDown, text: 'Every estimate compares old vs. new regime automatically.' },
  { icon: History, text: 'Save calculations and revisit them as your numbers change.' },
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <NavLink to="/" className="auth-brand">
          <span className="brand-mark" aria-hidden="true">
            <Landmark size={18} strokeWidth={2.25} />
          </span>
          <span className="brand-word">
            Tax<em>Wise</em>
          </span>
        </NavLink>

        <div className="auth-aside-body">
          <span className="stamp stamp-gold auth-stamp">FY 2025-26 ready</span>
          <h2>Plan your tax the way a ledger would — line by line.</h2>
          <ul className="auth-points">
            {points.map(({ icon: Icon, text }) => (
              <li key={text}>
                <Icon size={17} strokeWidth={2.25} />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="auth-main">
        <div className="auth-card card card-pad">
          <div className="auth-card-head">
            <h1>{title}</h1>
            {subtitle && <p className="text-soft">{subtitle}</p>}
          </div>
          {children}
          {footer && <div className="auth-card-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
