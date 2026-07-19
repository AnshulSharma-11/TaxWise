import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import { Calculator, LayoutList, PiggyBank, Scale, TrendingDown } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RegimeSplitChart from '../components/dashboard/RegimeSplitChart';
import TrendChart from '../components/dashboard/TrendChart';
import RegimeBadge from '../components/common/RegimeBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getDashboard } from '../api/tax';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatINR } from '../utils/format';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['tax-dashboard'],
    queryFn: getDashboard,
  });

  if (isLoading) {
    return <LoadingSpinner fullPage label="Loading your dashboard…" />;
  }

  const hasData = Boolean(data?.totalCalculations);

  return (
    <div className="container dash-page">
      <div className="dash-page-head">
        <span className="eyebrow">Dashboard</span>
        <h1>Hi {user?.fullName?.split(' ')[0] || 'there'}, here's your tax picture</h1>
        <p className="text-soft">A running summary of everything you've saved.</p>
      </div>

      {!hasData && (
        <div className="card card-pad dash-empty">
          <Calculator size={28} strokeWidth={1.75} />
          <h3>No saved calculations yet</h3>
          <p className="text-soft">Run the calculator and save a result to start seeing trends here.</p>
          <NavLink to="/calculator" className="btn btn-primary">
            Go to calculator
          </NavLink>
        </div>
      )}

      {hasData && (
        <>
          <div className="dash-stats">
            <StatCard
              icon={LayoutList}
              label="Saved calculations"
              value={data.totalCalculations}
              tone="navy"
            />
            <StatCard
              icon={Scale}
              label="Average tax liability"
              value={formatINR(data.averageTaxLiability)}
              tone="gold"
            />
            <StatCard
              icon={PiggyBank}
              label="Average taxable income"
              value={formatINR(data.averageTaxableIncome)}
              tone="navy"
            />
            <StatCard
              icon={TrendingDown}
              label="Latest potential savings"
              value={formatINR(data.latestPotentialSavings)}
              hint="vs. the other regime, on your latest estimate"
              tone="emerald"
            />
          </div>

          <div className="dash-grid">
            <div className="card card-pad dash-trend">
              <h3>Total tax over time</h3>
              <p className="text-faint" style={{ marginBottom: 'var(--space-3)' }}>
                Across your last {Math.min(data.recentCalculations.length, 10)} saved calculations
              </p>
              <TrendChart calculations={data.recentCalculations} />
            </div>

            <div className="card card-pad dash-split">
              <h3>Regime usage</h3>
              <p className="text-faint" style={{ marginBottom: 'var(--space-3)' }}>
                Which regime you've saved most often
              </p>
              <RegimeSplitChart oldCount={data.oldRegimeCount} newCount={data.newRegimeCount} />
            </div>
          </div>

          <div className="card dash-recent">
            <div className="dash-recent-head">
              <h3>Recent calculations</h3>
              <NavLink to="/history" className="btn btn-ghost btn-sm">
                View all
              </NavLink>
            </div>
            <ul className="dash-recent-list">
              {data.recentCalculations.slice(0, 5).map((calc) => (
                <li key={calc.id} className="dash-recent-row">
                  <div className="dash-recent-main">
                    <span className="dash-recent-label">{calc.label}</span>
                    <span className="text-faint">
                      FY {calc.financialYear} · {formatDate(calc.createdAt)}
                    </span>
                  </div>
                  <RegimeBadge regime={calc.regime} />
                  <span className="figure dash-recent-amount">{formatINR(calc.totalTaxLiability)}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
