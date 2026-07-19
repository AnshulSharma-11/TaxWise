export default function RegimeBadge({ regime }) {
  const isNew = regime === 'NEW';
  return <span className={`badge ${isNew ? 'badge-emerald' : 'badge-navy'}`}>{isNew ? 'New Regime' : 'Old Regime'}</span>;
}
