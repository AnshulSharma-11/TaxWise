import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCompactINR, formatDate, formatINR } from '../../utils/format';
import './TrendChart.css';

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="trend-tooltip">
      <p className="trend-tooltip-title">{label}</p>
      <p className="figure">{formatINR(payload[0].value)}</p>
    </div>
  );
}

export default function TrendChart({ calculations }) {
  if (!calculations?.length) return null;

  const data = [...calculations]
    .reverse()
    .map((c) => ({ date: formatDate(c.createdAt), tax: Math.round(c.totalTaxLiability) }));

  return (
    <div className="trend-chart">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e1d3" />
          <XAxis dataKey="date" tick={{ fill: '#4c5a70', fontSize: 12, fontFamily: 'Inter, sans-serif' }} axisLine={{ stroke: '#ddd8c8' }} tickLine={false} />
          <YAxis
            tickFormatter={(v) => formatCompactINR(v)}
            tick={{ fill: '#869099', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ stroke: '#1f6f54', strokeWidth: 1 }} />
          <Line type="monotone" dataKey="tax" stroke="#1f6f54" strokeWidth={2.5} dot={{ r: 4, fill: '#1f6f54' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
