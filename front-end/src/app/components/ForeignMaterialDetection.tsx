import { AlertTriangle, CheckCircle, Camera, Clock, ChevronDown, ChevronUp, X, ZoomIn } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useSite } from "../context/SiteContext";
import { useState, useEffect } from "react";
import { detectionApi } from "../../services/api";

const detectionImages: Record<number, { url: string; caption: string; camId: string; detectionBox?: { top: string; left: string; width: string; height: string } }> = {
  1: {
    url: "https://images.unsplash.com/photo-1481597262637-0545b18186ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwd2FyZWhvdXNlJTIwc2VjdXJpdHklMjBjYW1lcmElMjBzdXJ2ZWlsbGFuY2UlMjBpbmZyYXJlZCUyMHZpZXd8ZW58MXx8fHwxNzc0ODIxMTk5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    caption: "CAM-2A  |  BARN 2 / SEC-A  |  2026-03-29  08:15:42",
    camId: "CAM-2A",
    detectionBox: { top: "28%", left: "38%", width: "24%", height: "22%" },
  },
  2: {
    url: "https://images.unsplash.com/photo-1576469196969-7bcc7d58cbe6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFpbiUyMHN0b3JhZ2UlMjBiYXJuJTIwaW50ZXJpb3IlMjBvdmVyaGVhZCUyMGNvbnZleW9yJTIwYmVsdCUyMGxvYWRpbmd8ZW58MXx8fHwxNzc0ODIxMTk0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    caption: "CAM-3C  |  BARN 3 / SEC-C  |  2026-03-29  07:42:11",
    camId: "CAM-3C",
    detectionBox: { top: "40%", left: "20%", width: "20%", height: "18%" },
  },
  3: {
    url: "https://images.unsplash.com/photo-1752249764088-8fce47082092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbmclMjBtaW5lcmFsJTIwc3RvcmFnZSUyMGRvbWUlMjBpbnRlcmlvciUyMGJ1bGslMjBtYXRlcmlhbCUyMGNvbnZleW9yfGVufDF8fHx8MTc3NDgyMTIwM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    caption: "CAM-1B  |  BARN 1 / SEC-B  |  2026-03-29  06:30:05",
    camId: "CAM-1B",
    detectionBox: { top: "22%", left: "55%", width: "22%", height: "26%" },
  },
  4: {
    url: "https://images.unsplash.com/photo-1759085795607-d4da92f5c18e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZXJ0aWxpemVyJTIwZ3JhbnVsZXMlMjBtaW5lcmFsJTIwYWdncmVnYXRlJTIwcGlsZSUyMHN0b2NrcGlsZSUyMHRvcCUyMHZpZXd8ZW58MXx8fHwxNzc0ODIxMjAzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    caption: "CAM-4A  |  BARN 4 / SEC-A  |  2026-03-28  22:15:30",
    camId: "CAM-4A",
    detectionBox: { top: "33%", left: "60%", width: "18%", height: "20%" },
  },
  5: {
    url: "https://images.unsplash.com/photo-1758304481895-2e3cb9b7673e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWxrJTIwbWF0ZXJpYWwlMjBzYWx0JTIwbWluZXJhbCUyMGluZG9vciUyMHN0b3JhZ2UlMjBwaWxlJTIwd2FyZWhvdXNlJTIwYWVyaWFsfGVufDF8fHx8MTc3NDgyMTE5NXww&ixlib=rb-4.1.0&q=80&w=1080",
    caption: "CAM-2D  |  BARN 2 / SEC-D  |  2026-03-28  18:45:17",
    camId: "CAM-2D",
    detectionBox: { top: "45%", left: "30%", width: "22%", height: "19%" },
  },
  6: {
    url: "https://images.unsplash.com/photo-1718066236081-b36f8a1e52bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFpbiUyMHNpbG8lMjBjb252ZXlvciUyMGNodXRlJTIwbG9hZGluZyUyMG92ZXJoZWFkJTIwaW5zaWRlJTIwZmFjaWxpdHl8ZW58MXx8fHwxNzc0ODIxMjAwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    caption: "CAM-3B  |  BARN 3 / SEC-B  |  2026-03-28  14:20:58",
    camId: "CAM-3B",
    detectionBox: { top: "30%", left: "42%", width: "20%", height: "24%" },
  },
};

export function ForeignMaterialDetection() {
  const { selectedSite } = useSite();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [lightboxId, setLightboxId] = useState<number | null>(null);
  const [detectionData, setDetectionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetectionData() {
      try {
        setLoading(true);
        setError(null);
        const data = await detectionApi.getDetections(selectedSite);
        setDetectionData(data);
      } catch (err) {
        console.error('Error fetching detection data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load detection data');
        // Fallback to mock data on error
        setDetectionData({
          activeAlerts: 3,
          resolvedToday: 3,
          cameras: 16,
          accuracy: "98.5%",
          detections: [],
          weeklyData: [
            { day: "Mon", seeds: 3, droppings: 5, dust: 2 },
            { day: "Tue", seeds: 2, droppings: 4, dust: 1 },
            { day: "Wed", seeds: 4, droppings: 6, dust: 3 },
            { day: "Thu", seeds: 2, droppings: 3, dust: 2 },
            { day: "Fri", seeds: 3, droppings: 7, dust: 2 },
            { day: "Sat", seeds: 1, droppings: 4, dust: 1 },
            { day: "Sun", seeds: 2, droppings: 5, dust: 2 },
          ],
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDetectionData();
  }, [selectedSite]);

  const currentData = detectionData || {
    activeAlerts: 0,
    resolvedToday: 0,
    cameras: 0,
    accuracy: "0%",
    detections: [],
    weeklyData: [],
  };

  const detections = currentData.detections || [];

  const severityConfig: Record<string, { bg: string; text: string; label: string }> = {
    high:   { bg: "bg-red-100",    text: "text-red-700",    label: "High" },
    medium: { bg: "bg-amber-100",  text: "text-amber-700",  label: "Medium" },
    low:    { bg: "bg-blue-100",   text: "text-blue-700",   label: "Low" },
  };

  const statCards = [
    { label: "Active Alerts",    value: currentData.activeAlerts, sub: "Require attention",    valueClass: "text-amber-600" },
    { label: "Resolved Today",   value: currentData.resolvedToday, sub: "Cleaned and verified", valueClass: "text-emerald-600" },
    { label: "Cameras Active",   value: currentData.cameras,       sub: "All operational",      valueClass: "text-blue-600" },
    { label: "Detection Rate",   value: currentData.accuracy,      sub: "Accuracy this week",   valueClass: "text-zinc-900" },
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
            <p className={`mb-1 ${card.valueClass}`} style={{ fontSize: "1.8rem", fontWeight: 700, lineHeight: 1.2 }}>
              {card.value}
            </p>
            <p className="text-zinc-400" style={{ fontSize: "0.8rem" }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Weekly Chart */}
      <div className="bg-white rounded-xl p-6 border border-zinc-100 shadow-sm">
        <h3 className="text-zinc-800 mb-1">Weekly Detection Trends</h3>
        <p className="text-zinc-400 mb-5" style={{ fontSize: "0.82rem" }}>Foreign material detections over the past 7 days</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={currentData.weeklyData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f5" vertical={false} />
            <XAxis dataKey="day" stroke="#a1a1aa" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#a1a1aa" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} label={{ value: "Detections", angle: -90, position: "insideLeft", fontSize: 11, fill: "#a1a1aa" }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />
            <Legend wrapperStyle={{ fontSize: "0.82rem", paddingTop: "12px" }} />
            <Bar key="bar-seeds" dataKey="seeds" fill="#22c55e" name="Seeds" radius={[3, 3, 0, 0]} />
            <Bar key="bar-droppings" dataKey="droppings" fill="#f59e0b" name="Bird Droppings" radius={[3, 3, 0, 0]} />
            <Bar key="bar-dust" dataKey="dust" fill="#6366f1" name="Dust" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Detections */}
      <div className="bg-white rounded-xl p-6 border border-zinc-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-zinc-800 mb-0.5">Recent Detections</h3>
            <p className="text-zinc-400" style={{ fontSize: "0.82rem" }}>Click any detection to view the associated camera image</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-600" style={{ fontSize: "0.78rem", fontWeight: 600 }}>
            {detections.length} events
          </span>
        </div>

        <div className="space-y-3">
          {detections.map((detection) => {
            const isExpanded = expandedId === detection.id;
            const sev = severityConfig[detection.severity];
            const imgData = detectionImages[detection.id];

            return (
              <div
                key={detection.id}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  detection.status === "active"
                    ? "border-amber-200 bg-amber-50/60"
                    : "border-zinc-200 bg-zinc-50/60"
                } ${isExpanded ? "shadow-md" : "shadow-sm hover:shadow-md"}`}
              >
                {/* Clickable header row */}
                <button
                  className="w-full text-left p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : detection.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${detection.status === "active" ? "bg-amber-100" : "bg-zinc-200"}`}>
                        {detection.status === "active" ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-zinc-900" style={{ fontWeight: 600, fontSize: "0.92rem" }}>
                          {detection.type}
                        </p>
                        <div className="flex items-center gap-1.5 text-zinc-500 mt-0.5" style={{ fontSize: "0.8rem" }}>
                          <Camera className="w-3.5 h-3.5" />
                          <span>{detection.location}</span>
                          <span className="text-zinc-300">·</span>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{detection.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${sev.bg} ${sev.text}`}>
                        {sev.label}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          detection.status === "active"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {detection.status}
                      </span>
                      <div className={`ml-1 p-1 rounded-full transition-colors ${isExpanded ? "bg-zinc-200" : "bg-transparent"}`}>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-zinc-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expandable Image Panel */}
                {isExpanded && imgData && (
                  <div className="border-t border-zinc-200 bg-zinc-950">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Camera className="w-3.5 h-3.5 text-zinc-400" />
                          <p className="text-zinc-300" style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace" }}>
                            {imgData.camId} · Live Capture
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setLightboxId(detection.id); }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                          style={{ fontSize: "0.78rem", fontWeight: 600 }}
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                          Full Size
                        </button>
                      </div>

                      {/* Camera viewport */}
                      <div
                        className="relative rounded-lg overflow-hidden"
                        style={{ height: 240, background: "#0a0a0a" }}
                      >
                        {/* Slightly desaturated image */}
                        <img
                          src={imgData.url}
                          alt={`Detection: ${detection.type}`}
                          className="w-full h-full object-cover"
                          style={{ filter: "saturate(0.6) contrast(1.1) brightness(0.9)" }}
                        />

                        {/* Subtle scan-line overlay */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 3px)",
                          }}
                        />

                        {/* Corner brackets — top-left */}
                        <div className="absolute top-2 left-2 pointer-events-none">
                          <div style={{ width: 16, height: 16, borderTop: "2px solid #00ff88", borderLeft: "2px solid #00ff88" }} />
                        </div>
                        {/* Corner brackets — top-right */}
                        <div className="absolute top-2 right-2 pointer-events-none">
                          <div style={{ width: 16, height: 16, borderTop: "2px solid #00ff88", borderRight: "2px solid #00ff88" }} />
                        </div>
                        {/* Corner brackets — bottom-left */}
                        <div className="absolute bottom-8 left-2 pointer-events-none">
                          <div style={{ width: 16, height: 16, borderBottom: "2px solid #00ff88", borderLeft: "2px solid #00ff88" }} />
                        </div>
                        {/* Corner brackets — bottom-right */}
                        <div className="absolute bottom-8 right-2 pointer-events-none">
                          <div style={{ width: 16, height: 16, borderBottom: "2px solid #00ff88", borderRight: "2px solid #00ff88" }} />
                        </div>

                        {/* REC indicator */}
                        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none">
                          <span
                            className="w-2 h-2 rounded-full bg-red-500 animate-pulse"
                            style={{ boxShadow: "0 0 6px #ef4444" }}
                          />
                          <span className="text-red-400" style={{ fontSize: "0.65rem", fontFamily: "monospace", letterSpacing: "0.1em", fontWeight: 700 }}>
                            REC
                          </span>
                        </div>

                        {/* Detection bounding box */}
                        {imgData.detectionBox && (
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              top: imgData.detectionBox.top,
                              left: imgData.detectionBox.left,
                              width: imgData.detectionBox.width,
                              height: imgData.detectionBox.height,
                              border: `2px solid ${detection.severity === "high" ? "#ef4444" : detection.severity === "medium" ? "#f59e0b" : "#3b82f6"}`,
                              boxShadow: `0 0 8px ${detection.severity === "high" ? "rgba(239,68,68,0.6)" : detection.severity === "medium" ? "rgba(245,158,11,0.6)" : "rgba(59,130,246,0.6)"}`,
                            }}
                          >
                            {/* Label tag on detection box */}
                            <span
                              className="absolute -top-5 left-0 px-1.5 py-0.5"
                              style={{
                                fontSize: "0.6rem",
                                fontFamily: "monospace",
                                fontWeight: 700,
                                letterSpacing: "0.05em",
                                backgroundColor: detection.severity === "high" ? "#ef4444" : detection.severity === "medium" ? "#f59e0b" : "#3b82f6",
                                color: "white",
                              }}
                            >
                              {detection.type.toUpperCase()} · {sev.label.toUpperCase()}
                            </span>
                          </div>
                        )}

                        {/* Bottom HUD bar */}
                        <div
                          className="absolute bottom-0 left-0 right-0 px-3 py-1.5 flex items-center justify-between"
                          style={{ background: "rgba(0,0,0,0.72)" }}
                        >
                          <span style={{ fontSize: "0.65rem", fontFamily: "monospace", color: "#00ff88", letterSpacing: "0.06em" }}>
                            {imgData.caption}
                          </span>
                          <span style={{ fontSize: "0.65rem", fontFamily: "monospace", color: "#a1a1aa" }}>
                            SmartDome AI
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxId !== null && detectionImages[lightboxId] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
          onClick={() => setLightboxId(null)}
        >
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={detectionImages[lightboxId].url}
              alt="Detection full view"
              className="w-full object-cover"
              style={{ maxHeight: "70vh" }}
            />
            <div className="absolute bottom-0 left-0 right-0 px-5 py-4" style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }}>
              <p className="text-white" style={{ fontSize: "0.9rem" }}>{detectionImages[lightboxId].caption}</p>
            </div>
            <button
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              onClick={() => setLightboxId(null)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}