import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCompactINR, formatINR } from '../../utils/format';
import './ComparisonChart.css';

const COLORS = { tax: '#a83a34', takeHome: '#1f6f54' };

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-title">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="chart-tooltip-row" style={{ color: entry.color }}>
          <span>{entry.name}</span>
          <span className="figure">{formatINR(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

export default function ComparisonChart({ oldResult, newResult }) {
  if (!oldResult || !newResult) return null;

  const data = [
    {
      name: 'Old regime',
      'Total tax': Math.round(oldResult.totalTaxLiability),
      'Take-home': Math.round(oldResult.netTakeHomeAnnual),
    },
    {
      name: 'New regime',
      'Total tax': Math.round(newResult.totalTaxLiability),
      'Take-home': Math.round(newResult.netTakeHomeAnnual),
    },
  ];

  return (
    <div className="comparison-chart">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e1d3" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#4c5a70', fontFamily: 'Inter, sans-serif', fontSize: 13 }}
            axisLine={{ stroke: '#ddd8c8' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatCompactINR(v)}
            tick={{ fill: '#869099', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(27,42,74,0.05)' }} />
          <Legend wrapperStyle={{ fontSize: 13, fontFamily: 'Inter, sans-serif' }} />
          <Bar dataKey="Total tax" fill={COLORS.tax} radius={[4, 4, 0, 0]} maxBarSize={64} />
          <Bar dataKey="Take-home" fill={COLORS.takeHome} radius={[4, 4, 0, 0]} maxBarSize={64} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
