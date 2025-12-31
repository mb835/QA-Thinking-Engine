import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ===== MOCK DATA ===== */

const scenarioTrend = [
  { date: "29.12", count: 3 },
  { date: "30.12", count: 6 },
  { date: "31.12", count: 4 },
];

const testTypeDistribution = [
  { name: "ACCEPTANCE", value: 3 },
  { name: "NEGATIVE", value: 2 },
  { name: "EDGE", value: 1 },
  { name: "SECURITY", value: 1 },
  { name: "UX", value: 1 },
];

const COLORS: Record<string, string> = {
  ACCEPTANCE: "#6366f1",
  NEGATIVE: "#ef4444",
  EDGE: "#f59e0b",
  SECURITY: "#22c55e",
  UX: "#14b8a6",
};

/* ===== COMPONENTS ===== */

export function ScenarioTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={scenarioTrend}>
        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
        <XAxis dataKey="date" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" allowDecimals={false} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TestTypePieChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={testTypeDistribution}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
        >
          {testTypeDistribution.map((entry) => (
            <Cell
              key={entry.name}
              fill={COLORS[entry.name]}
            />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
