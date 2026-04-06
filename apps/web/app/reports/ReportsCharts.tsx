'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#14b8a6', '#f97316'];

const chartContentStyle = {
  backgroundColor: '#1e293b',
  border: '2px solid #334155',
  borderRadius: '8px',
  color: '#f1f5f9',
};
const axisStyle = { fill: '#f1f5f9' };
const legendStyle = { color: '#f1f5f9' };

interface ReportsChartsProps {
  xpDistribution: Array<{ range: string; count: number }>;
  topUsers: Array<{ rank: number; name: string; xp: number }>;
}

export default function ReportsCharts({ xpDistribution, topUsers }: ReportsChartsProps) {
  return (
    <>
      {/* XP Distribution Chart */}
      <div className="bg-card border-2 border-border rounded-xl p-6">
        <h2 className="text-2xl font-bold text-text mb-6">XP Distribution</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={xpDistribution}>
              <XAxis dataKey="range" stroke="#94a3b8" style={axisStyle} />
              <YAxis stroke="#94a3b8" style={axisStyle} />
              <Tooltip contentStyle={chartContentStyle} />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Users Pie Chart */}
      <div className="bg-card border-2 border-border rounded-xl p-6">
        <h2 className="text-2xl font-bold text-text mb-6">Top 10 Users by XP</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={topUsers}
                dataKey="xp"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#3b82f6"
                label={({ name, xp }: { name: string; xp: number }) => `${name}: ${xp}`}
                labelStyle={{ fill: '#f1f5f9', fontSize: '12px' }}
              >
                {topUsers.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={chartContentStyle} />
              <Legend wrapperStyle={legendStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
