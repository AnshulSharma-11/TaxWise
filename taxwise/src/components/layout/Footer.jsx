import { Landmark } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div className="footer-brand">
          <Landmark size={16} strokeWidth={2.25} />
          <span>TaxWise</span>
        </div>
        <p className="text-faint footer-note">
          Built for quick estimates under the Indian Income Tax Act — old vs. new regime. Not a substitute for
          advice from a qualified chartered accountant.
        </p>
        <p className="text-faint footer-year">© {new Date().getFullYear()} TaxWise</p>
      </div>
    </footer>
  );
}
