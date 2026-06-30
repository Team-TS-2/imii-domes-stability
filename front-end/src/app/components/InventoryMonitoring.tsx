import { Package, TrendingUp, TrendingDown } from "lucide-react";
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { useSite } from "../context/SiteContext";

export function InventoryMonitoring() {
  const { selectedSite } = useSite();

  const siteInventoryData: Record<string, any> = {
    "Nutrien Allan": {
      totalInventory: "8,450 tons",
      totalChange: "+255",
      totalCapacity: 10000,
      avgDailyChange: "+36",
      barns: [
        { id: 1, name: "Barn 1", current: 2450, capacity: 3000, status: "good", change: "+120" },
        { id: 2, name: "Barn 2", current: 2100, capacity: 2500, status: "good", change: "+85" },
        { id: 3, name: "Barn 3", current: 1900, capacity: 2000, status: "warning", change: "-150" },
        { id: 4, name: "Barn 4", current: 2000, capacity: 2500, status: "good", change: "+200" },
      ],
      volumeData: [
        { date: "Mar 22", total: 8195 },
        { date: "Mar 23", total: 8260 },
        { date: "Mar 24", total: 8340 },
        { date: "Mar 25", total: 8410 },
        { date: "Mar 26", total: 8450 },
        { date: "Mar 27", total: 8465 },
        { date: "Mar 28", total: 8450 },
      ],
    },
    "Nutrien Lanigan": {
      totalInventory: "9,200 tons",
      totalChange: "+180",
      totalCapacity: 10000,
      avgDailyChange: "+26",
      barns: [
        { id: 5, name: "Barn 1", current: 2600, capacity: 2800, status: "good", change: "+80" },
        { id: 6, name: "Barn 2", current: 2400, capacity: 2600, status: "good", change: "+45" },
        { id: 7, name: "Barn 3", current: 2100, capacity: 2300, status: "good", change: "+30" },
        { id: 8, name: "Barn 4", current: 2100, capacity: 2300, status: "good", change: "+25" },
      ],
      volumeData: [
        { date: "Mar 22", total: 9020 },
        { date: "Mar 23", total: 9060 },
        { date: "Mar 24", total: 9100 },
        { date: "Mar 25", total: 9130 },
        { date: "Mar 26", total: 9165 },
        { date: "Mar 27", total: 9185 },
        { date: "Mar 28", total: 9200 },
      ],
    },
    "Nutrien Cory": {
      totalInventory: "7,800 tons",
      totalChange: "+120",
      totalCapacity: 10000,
      avgDailyChange: "+17",
      barns: [
        { id: 9,  name: "Barn 1", current: 2200, capacity: 2800, status: "good", change: "+50" },
        { id: 10, name: "Barn 2", current: 1900, capacity: 2500, status: "good", change: "+30" },
        { id: 11, name: "Barn 3", current: 1800, capacity: 2200, status: "warning", change: "+20" },
        { id: 12, name: "Barn 4", current: 1900, capacity: 2500, status: "good", change: "+20" },
      ],
      volumeData: [
        { date: "Mar 22", total: 7680 },
        { date: "Mar 23", total: 7705 },
        { date: "Mar 24", total: 7730 },
        { date: "Mar 25", total: 7750 },
        { date: "Mar 26", total: 7770 },
        { date: "Mar 27", total: 7785 },
        { date: "Mar 28", total: 7800 },
      ],
    },
    "Nutrien Rocanville": {
      totalInventory: "8,900 tons",
      totalChange: "+215",
      totalCapacity: 10000,
      avgDailyChange: "+31",
      barns: [
        { id: 13, name: "Barn 1", current: 2500, capacity: 2800, status: "good", change: "+90" },
        { id: 14, name: "Barn 2", current: 2300, capacity: 2600, status: "good", change: "+65" },
        { id: 15, name: "Barn 3", current: 2000, capacity: 2300, status: "good", change: "+35" },
        { id: 16, name: "Barn 4", current: 2100, capacity: 2300, status: "good", change: "+25" },
      ],
      volumeData: [
        { date: "Mar 22", total: 8685 },
        { date: "Mar 23", total: 8725 },
        { date: "Mar 24", total: 8770 },
        { date: "Mar 25", total: 8815 },
        { date: "Mar 26", total: 8850 },
        { date: "Mar 27", total: 8875 },
        { date: "Mar 28", total: 8900 },
      ],
    },
    "Mosaic Esterhazy": {
      totalInventory: "8,100 tons",
      totalChange: "+145",
      totalCapacity: 10000,
      avgDailyChange: "+21",
      barns: [
        { id: 17, name: "Barn 1", current: 2300, capacity: 2800, status: "good", change: "+70" },
        { id: 18, name: "Barn 2", current: 2000, capacity: 2500, status: "good", change: "+40" },
        { id: 19, name: "Barn 3", current: 1850, capacity: 2200, status: "warning", change: "+15" },
        { id: 20, name: "Barn 4", current: 1950, capacity: 2500, status: "good", change: "+20" },
      ],
      volumeData: [
        { date: "Mar 22", total: 7955 },
        { date: "Mar 23", total: 7985 },
        { date: "Mar 24", total: 8020 },
        { date: "Mar 25", total: 8045 },
        { date: "Mar 26", total: 8070 },
        { date: "Mar 27", total: 8085 },
        { date: "Mar 28", total: 8100 },
      ],
    },
  };

  const currentData = siteInventoryData[selectedSite];
  const barns = currentData.barns;
  const volumeData = currentData.volumeData;

  const distributionData = barns.map((barn: any) => ({
    name: barn.name,
    value: barn.current,
  }));

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

  const totalCapacity = barns.reduce((sum: number, barn: any) => sum + barn.capacity, 0);
  const totalCurrent = barns.reduce((sum: number, barn: any) => sum + barn.current, 0);
  const utilizationRate = ((totalCurrent / totalCapacity) * 100).toFixed(1);

  const statCards = [
    { label: "Total Inventory", value: currentData.totalInventory, sub: `${currentData.totalChange} today`, subColor: "text-emerald-600", icon: TrendingUp },
    { label: "Total Capacity", value: `${currentData.totalCapacity.toLocaleString()} t`, sub: "Across 4 barns", subColor: "text-zinc-400", icon: null },
    { label: "Utilization", value: `${utilizationRate}%`, sub: "Current capacity", subColor: "text-zinc-400", icon: null },
    { label: "Avg. Daily Change", value: `${currentData.avgDailyChange} t`, sub: "7-day average", subColor: "text-zinc-400", icon: null },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-5 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-zinc-500 mb-1" style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              {card.label}
            </p>
            <p className="text-zinc-900 mb-1" style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1.2 }}>
              {card.value}
            </p>
            <div className={`flex items-center gap-1 ${card.subColor}`} style={{ fontSize: "0.8rem" }}>
              {card.icon && <card.icon className="w-3.5 h-3.5" />}
              <span>{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-6 border border-zinc-100 shadow-sm">
          <h3 className="text-zinc-800 mb-0.5">Volume Trends</h3>
          <p className="text-zinc-400 mb-5" style={{ fontSize: "0.82rem" }}>Total potash inventory over the past 7 days (tons)</p>
          <ResponsiveContainer width="100%" height={270}>
            <AreaChart data={volumeData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f5" vertical={false} />
              <XAxis dataKey="date" stroke="#a1a1aa" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#a1a1aa" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              />
              <Legend wrapperStyle={{ fontSize: "0.82rem", paddingTop: "12px" }} />
              <Area key="area-total" type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} fill="url(#areaGrad)" name="Total (tons)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-zinc-100 shadow-sm">
          <h3 className="text-zinc-800 mb-0.5">Distribution by Barn</h3>
          <p className="text-zinc-400 mb-5" style={{ fontSize: "0.82rem" }}>Current inventory share per barn</p>
          <ResponsiveContainer width="100%" height={270}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                innerRadius={40}
                dataKey="value"
                paddingAngle={3}
              >
                {distributionData.map((entry: any, index: number) => (
                  <Cell key={`pie-cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                formatter={(value: number) => [`${value.toLocaleString()} tons`, "Inventory"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Barn Cards */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100">
          <h3 className="text-zinc-800">Barn Status</h3>
          <p className="text-zinc-400 mt-0.5" style={{ fontSize: "0.82rem" }}>Individual barn capacity and inventory levels</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {barns.map((barn: any, index: number) => {
              const pct = Math.round((barn.current / barn.capacity) * 100);
              const isPositive = barn.change.startsWith("+");
              return (
                <div key={barn.id} className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 hover:shadow-sm transition-shadow">
                  {/* Top accent bar */}
                  <div className="h-1 rounded-full mb-4" style={{ backgroundColor: COLORS[index] }} />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-zinc-800" style={{ fontWeight: 600 }}>{barn.name}</span>
                    <Package className="w-4 h-4" style={{ color: COLORS[index] }} />
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-zinc-500" style={{ fontSize: "0.8rem" }}>Current</span>
                      <span className="text-zinc-800" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{barn.current.toLocaleString()} t</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-zinc-400" style={{ fontSize: "0.78rem" }}>Capacity</span>
                      <span className="text-zinc-500" style={{ fontSize: "0.78rem" }}>{barn.capacity.toLocaleString()} t</span>
                    </div>
                    <div className="w-full bg-zinc-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[index] }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-zinc-400" style={{ fontSize: "0.72rem" }}>{pct}% full</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
                    <span className="text-zinc-400" style={{ fontSize: "0.78rem" }}>Today</span>
                    <div className={`flex items-center gap-1 ${isPositive ? "text-emerald-600" : "text-red-600"}`} style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                      {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>{barn.change} t</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
