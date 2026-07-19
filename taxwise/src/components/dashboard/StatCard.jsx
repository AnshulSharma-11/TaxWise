import './StatCard.css';

export default function StatCard({ icon: Icon, label, value, hint, tone = 'navy' }) {
  return (
    <div className="card card-pad stat-card">
      <span className={`stat-card-icon stat-card-icon-${tone}`}>
        <Icon size={18} strokeWidth={2.25} />
      </span>
      <span className="stat-card-label">{label}</span>
      <span className="figure stat-card-value">{value}</span>
      {hint && <span className="text-faint stat-card-hint">{hint}</span>}
    </div>
  );
}
