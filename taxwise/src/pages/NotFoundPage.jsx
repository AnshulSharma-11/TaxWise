import { NavLink } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="container">
      <div className="placeholder-page card card-pad" style={{ margin: '64px auto' }}>
        <span className="placeholder-icon">
          <Compass size={22} strokeWidth={2.25} />
        </span>
        <h2>Page not found</h2>
        <p className="text-soft">The page you're looking for doesn't exist, or may have moved.</p>
        <NavLink to="/" className="btn btn-primary">
          Back to home
        </NavLink>
      </div>
    </div>
  );
}
