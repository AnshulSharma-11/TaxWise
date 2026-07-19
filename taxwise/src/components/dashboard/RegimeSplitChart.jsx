import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import './RegimeSplitChart.css';

const COLORS = { Old: '#1b2a4a', New: '#1f6f54' };

export default function RegimeSplitChart({ oldCount, newCount }) {
  const total = oldCount + newCount;
  if (total === 0) return null;

  const data = [
    { name: 'Old', value: oldCount },
    { name: 'New', value: newCount },
  ];

  return (
    <div className="regime-split-chart">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={3}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} calculation${value === 1 ? '' : 's'}`, `${name} regime`]}
            contentStyle={{ fontSize: 13, fontFamily: 'Inter, sans-serif', borderRadius: 8 }}
          />
          <Legend
            verticalAlign="bottom"
            formatter={(value) => `${value} regime`}
            wrapperStyle={{ fontSize: 13, fontFamily: 'Inter, sans-serif' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
