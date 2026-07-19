import { NavLink } from 'react-router-dom';
import { ArrowRight, Calculator, GitCompareArrows, PiggyBank, ReceiptText } from 'lucide-react';
import './LandingPage.css';

const features = [
  {
    icon: Calculator,
    title: 'Compute in one pass',
    body: 'Enter your salary, HRA and deductions once. TaxWise applies the current slab rules, standard deduction, cess and surcharge automatically.',
  },
  {
    icon: GitCompareArrows,
    title: 'Old vs. new, side by side',
    body: 'Every calculation is run against both regimes for the same inputs — so the better option is a number, not a guess.',
  },
  {
    icon: PiggyBank,
    title: 'Track it year to year',
    body: 'Save each estimate to your history and watch how salary changes, HRA and 80C planning move your final liability.',
  },
];

const steps = [
  { n: '01', title: 'Enter your numbers', body: 'Gross salary, HRA, rent, and the deductions you actually claim.' },
  { n: '02', title: 'See both regimes', body: 'TaxWise runs the old and new regime side by side and flags the cheaper one.' },
  { n: '03', title: 'Save & export', body: 'Keep a dated record, or download a PDF summary for your files.' },
];

export default function LandingPage() {
  return (
    <div className="landing">
      <section className="container hero">
        <div className="hero-copy">
          <span className="eyebrow">FY 2025-26 slabs · Union Budget updated</span>
          <h1>
            Old regime or new? <span className="hero-highlight">Know the number,</span> not just the guess.
          </h1>
          <p className="hero-sub">
            TaxWise runs your salary through both Indian income-tax regimes at once, shows exactly where the
            rupees go, and keeps a dated ledger of every estimate you save.
          </p>
          <div className="hero-actions">
            <NavLink to="/register" className="btn btn-primary btn-lg">
              Get started free
              <ArrowRight size={17} />
            </NavLink>
            <NavLink to="/calculator" className="btn btn-outline btn-lg">
              Try the calculator
            </NavLink>
          </div>
          <p className="hero-fineprint text-faint">No card required · Guest calculations don't need an account</p>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="receipt">
            <div className="receipt-head">
              <ReceiptText size={16} />
              <span>Estimate · FY 2025-26</span>
            </div>
            <div className="receipt-row">
              <span>Gross salary</span>
              <span className="figure">₹18,00,000</span>
            </div>
            <hr className="divider" />
            <div className="receipt-compare">
              <div className="receipt-regime">
                <span className="stamp stamp-navy">Old</span>
                <span className="figure receipt-amount">₹2,49,600</span>
              </div>
              <div className="receipt-regime is-winner">
                <span className="stamp stamp-emerald">New</span>
                <span className="figure receipt-amount">₹1,90,320</span>
              </div>
            </div>
            <hr className="divider" />
            <div className="receipt-row receipt-savings">
              <span>You save with New</span>
              <span className="figure">₹59,280</span>
            </div>
          </div>
          <div className="hero-visual-caption text-faint">Illustrative example — your figures may differ</div>
        </div>
      </section>

      <section className="container features">
        <div className="section-head">
          <span className="eyebrow">What you get</span>
          <h2>Built around the one decision that matters</h2>
        </div>
        <div className="feature-grid">
          {features.map(({ icon: Icon, title, body }) => (
            <div className="feature-card card card-pad" key={title}>
              <span className="feature-icon">
                <Icon size={20} strokeWidth={2.25} />
              </span>
              <h3>{title}</h3>
              <p className="text-soft">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="steps-section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h2>Three steps, about a minute</h2>
          </div>
          <div className="steps-grid">
            {steps.map((step) => (
              <div className="step" key={step.n}>
                <span className="step-number figure">{step.n}</span>
                <h3>{step.title}</h3>
                <p className="text-soft">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container cta-band">
        <div className="cta-card">
          <div>
            <h2>Run your own numbers</h2>
            <p className="text-soft">Free, and no account needed to see a result.</p>
          </div>
          <NavLink to="/calculator" className="btn btn-primary btn-lg">
            Open the calculator
            <ArrowRight size={17} />
          </NavLink>
        </div>
      </section>
    </div>
  );
}
