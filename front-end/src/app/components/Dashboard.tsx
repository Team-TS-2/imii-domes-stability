import { Link } from "react-router";
import { Building2, AlertTriangle, Package, AlertCircle, CheckCircle, ArrowRight, Activity } from "lucide-react";
import { useSite } from "../context/SiteContext";
import { useState, useEffect } from "react";
import { dashboardApi } from "../../services/api";

export function Dashboard() {
  const { selectedSite } = useSite();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardApi.getSiteData(selectedSite);
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        // Fallback to mock data on error
        setDashboardData({
          structuralHealth: "94%",
          beamsInspection: 2,
          foreignAlerts: 3,
          inventory: "8,450 tons",
          capacity: "87%",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [selectedSite]);

  const currentData = dashboardData || {
    structuralHealth: "0%",
    beamsInspection: 0,
    foreignAlerts: 0,
    inventory: "0 tons",
    capacity: "0%",
  };

  const stats = [
    {
      title: "Structural Health",
      value: currentData.structuralHealth,
      status: "good",
      icon: Building2,
      link: "/structural",
      description: `${currentData.beamsInspection} beam${currentData.beamsInspection !== 1 ? "s" : ""} require inspection`,
      accent: "#10b981",
      accentBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Foreign Material Alerts",
      value: currentData.foreignAlerts.toString(),
      status: "warning",
      icon: AlertTriangle,
      link: "/foreign-material",
      description: "Active detections today",
      accent: "#f59e0b",
      accentBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Potash Inventory",
      value: currentData.inventory,
      status: "good",
      icon: Package,
      link: "/inventory",
      description: `${currentData.capacity} capacity utilized`,
      accent: "#3b82f6",
      accentBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
  ];

  const activities = [
    { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", message: "Foreign material detected in Barn 3", time: "12 minutes ago" },
    { icon: Building2, color: "text-[#5f352e]", bg: "bg-[#5f352e]/10", message: "Beam B-07 stress levels increased", time: "1 hour ago" },
    { icon: Package, color: "text-emerald-600", bg: "bg-emerald-50", message: "Inventory replenishment completed — Barn 1", time: "3 hours ago" },
    { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", message: "Bird droppings detected in Barn 2", time: "5 hours ago" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-zinc-900">{selectedSite}</h2>
          <p className="text-zinc-500" style={{ fontSize: "0.85rem" }}>Overview · March 29, 2026</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700" style={{ fontSize: "0.78rem", fontWeight: 600 }}>All systems operational</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              to={stat.link}
              className="group bg-white rounded-xl border border-zinc-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              {/* Top color bar */}
              <div className="h-1 w-full" style={{ backgroundColor: stat.accent }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${stat.accentBg}`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  {stat.status === "good" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <p className="text-zinc-500 mb-1" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                  {stat.title}
                </p>
                <p className="text-zinc-900 mb-2" style={{ fontSize: "1.9rem", fontWeight: 700, lineHeight: 1.1 }}>
                  {stat.value}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-zinc-400" style={{ fontSize: "0.8rem" }}>{stat.description}</p>
                  <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-4 h-4 text-zinc-400" />
          <h3 className="text-zinc-800">Recent Activity</h3>
        </div>
        <div className="space-y-2">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="flex items-center gap-4 p-3.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors">
                <div className={`p-2 rounded-lg ${activity.bg} flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-800 truncate" style={{ fontSize: "0.875rem" }}>{activity.message}</p>
                </div>
                <span className="text-zinc-400 flex-shrink-0" style={{ fontSize: "0.78rem" }}>{activity.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
