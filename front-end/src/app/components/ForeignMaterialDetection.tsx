import { AlertTriangle, CheckCircle, Camera, Clock, ChevronDown, ChevronUp, X, ZoomIn } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useSite } from "../context/SiteContext";
import { useState } from "react";

// Two naturally pinkish-red potash conveyor backgrounds
const POTASH_A = "https://images.unsplash.com/photo-1757030625779-e1033c11057b?w=800&q=80";
const POTASH_B = "https://images.unsplash.com/photo-1757030625811-7347b2eeb8ef?w=800&q=80";

interface TypeMeta {
  potashBg: string;
  contaminantUrl: string;
  contaminantBlend: "multiply" | "screen" | "overlay";
  contaminantPlacement: { top: string; left: string; width: string; height: string };
  detectionBox: { top: string; left: string; width: string; height: string };
}

// Each contaminant composited over potash via CSS blend modes:
//   multiply -> removes white photo bg, dark object remains on potash
//   screen   -> removes dark photo bg, bright highlights appear on potash
const TYPE_META: Record<string, TypeMeta> = {
  "Rubber Glove": {
    potashBg: POTASH_A,
    contaminantUrl: "https://images.unsplash.com/photo-1611075384665-b657035a7022?w=600&q=80",
    contaminantBlend: "multiply",
    contaminantPlacement: { top: "8%", left: "12%", width: "76%", height: "80%" },
    detectionBox: { top: "6%", left: "10%", width: "80%", height: "84%" },
  },
  "Belt Fragment": {
    potashBg: POTASH_B,
    contaminantUrl: "https://images.unsplash.com/photo-1608920765563-4893273bc9fa?w=600&q=80",
    contaminantBlend: "multiply",
    contaminantPlacement: { top: "22%", left: "4%", width: "92%", height: "54%" },
    detectionBox: { top: "20%", left: "2%", width: "96%", height: "58%" },
  },
  "Earring": {
    potashBg: POTASH_A,
    contaminantUrl: "https://images.unsplash.com/photo-1702476320482-0736c4b962f5?w=600&q=80",
    contaminantBlend: "multiply",
    contaminantPlacement: { top: "6%", left: "28%", width: "44%", height: "84%" },
    detectionBox: { top: "4%", left: "26%", width: "48%", height: "88%" },
  },
  "Metal Ring": {
    potashBg: POTASH_A,
    contaminantUrl: "https://images.unsplash.com/photo-1687858477667-d5dc55100409?w=600&q=80",
    contaminantBlend: "multiply",
    contaminantPlacement: { top: "10%", left: "24%", width: "52%", height: "78%" },
    detectionBox: { top: "8%", left: "22%", width: "56%", height: "82%" },
  },
  "Seeds": {
    potashBg: POTASH_B,
    contaminantUrl: "https://images.unsplash.com/photo-1762710597245-3557d83b2b39?w=600&q=80",
    contaminantBlend: "screen",
    contaminantPlacement: { top: "14%", left: "4%", width: "92%", height: "70%" },
    detectionBox: { top: "12%", left: "2%", width: "96%", height: "74%" },
  },
  "Bird Droppings": {
    potashBg: POTASH_B,
    contaminantUrl: "https://images.unsplash.com/photo-1768144931674-d5f5dad44f2a?w=600&q=80",
    contaminantBlend: "screen",
    contaminantPlacement: { top: "16%", left: "6%", width: "88%", height: "66%" },
    detectionBox: { top: "14%", left: "4%", width: "92%", height: "70%" },
  },
};

interface Detection {
  id: string;
  type: string;
  severity: "High" | "Medium" | "Low";
  camera: string;
  location: string;
  timestamp: string;
  status: "Active" | "Resolved";
}

const SITE_DETECTIONS: Record<string, Detection[]> = {
  "Nutrien Allan": [
    { id: "FMD-001", type: "Rubber Glove",   severity: "High",   camera: "CAM-B3-01", location: "Barn 3 – Belt Section 2",   timestamp: "09:14 AM", status: "Active" },
    { id: "FMD-002", type: "Belt Fragment",   severity: "Medium", camera: "CAM-B1-03", location: "Barn 1 – Entry Conveyor",    timestamp: "08:52 AM", status: "Active" },
    { id: "FMD-003", type: "Earring",         severity: "High",   camera: "CAM-B2-02", location: "Barn 2 – Discharge Section", timestamp: "07:30 AM", status: "Resolved" },
    { id: "FMD-004", type: "Metal Ring",      severity: "Medium", camera: "CAM-B4-01", location: "Barn 4 – Loading Belt",      timestamp: "06:45 AM", status: "Resolved" },
    { id: "FMD-005", type: "Seeds",           severity: "Low",    camera: "CAM-B3-04", location: "Barn 3 – Transfer Point",    timestamp: "05:20 AM", status: "Resolved" },
    { id: "FMD-006", type: "Bird Droppings",  severity: "Low",    camera: "CAM-B1-02", location: "Barn 1 – Overhead Section",  timestamp: "04:15 AM", status: "Resolved" },
  ],
  "Nutrien Lanigan": [
    { id: "FMD-001", type: "Belt Fragment",   severity: "High",   camera: "CAM-A2-01", location: "Aisle 2 – Main Conveyor",   timestamp: "10:02 AM", status: "Active" },
    { id: "FMD-002", type: "Metal Ring",      severity: "Medium", camera: "CAM-A1-02", location: "Aisle 1 – Reclaim Belt",    timestamp: "09:41 AM", status: "Active" },
    { id: "FMD-003", type: "Rubber Glove",   severity: "Medium", camera: "CAM-A3-01", location: "Aisle 3 – Belt B",          timestamp: "08:10 AM", status: "Resolved" },
    { id: "FMD-004", type: "Bird Droppings",  severity: "Low",    camera: "CAM-A2-03", location: "Aisle 2 – Roof Zone",       timestamp: "07:05 AM", status: "Resolved" },
    { id: "FMD-005", type: "Seeds",           severity: "Low",    camera: "CAM-A4-01", location: "Aisle 4 – Feed Conveyor",   timestamp: "06:00 AM", status: "Resolved" },
    { id: "FMD-006", type: "Earring",         severity: "High",   camera: "CAM-A1-04", location: "Aisle 1 – Discharge Zone",  timestamp: "04:50 AM", status: "Resolved" },
  ],
  "Nutrien Cory": [
    { id: "FMD-001", type: "Earring",         severity: "High",   camera: "CAM-C1-02", location: "Cell 1 – Transfer Belt",    timestamp: "11:18 AM", status: "Active" },
    { id: "FMD-002", type: "Rubber Glove",   severity: "High",   camera: "CAM-C3-01", location: "Cell 3 – Entry Point",      timestamp: "10:35 AM", status: "Active" },
    { id: "FMD-003", type: "Bird Droppings",  severity: "Low",    camera: "CAM-C2-03", location: "Cell 2 – Overhead",         timestamp: "09:00 AM", status: "Active" },
    { id: "FMD-004", type: "Belt Fragment",   severity: "Medium", camera: "CAM-C4-02", location: "Cell 4 – Return Belt",      timestamp: "08:22 AM", status: "Resolved" },
    { id: "FMD-005", type: "Metal Ring",      severity: "Medium", camera: "CAM-C1-04", location: "Cell 1 – Loading Chute",    timestamp: "06:55 AM", status: "Resolved" },
    { id: "FMD-006", type: "Seeds",           severity: "Low",    camera: "CAM-C3-03", location: "Cell 3 – Side Belt",        timestamp: "05:30 AM", status: "Resolved" },
  ],
  "Nutrien Rocanville": [
    { id: "FMD-001", type: "Seeds",           severity: "Low",    camera: "CAM-R2-01", location: "Section 2 – Reclaim",       timestamp: "08:40 AM", status: "Active" },
    { id: "FMD-002", type: "Belt Fragment",   severity: "Medium", camera: "CAM-R1-03", location: "Section 1 – Stacker Belt",  timestamp: "07:15 AM", status: "Resolved" },
    { id: "FMD-003", type: "Rubber Glove",   severity: "High",   camera: "CAM-R3-02", location: "Section 3 – Main Belt",     timestamp: "06:30 AM", status: "Resolved" },
    { id: "FMD-004", type: "Earring",         severity: "Medium", camera: "CAM-R2-04", location: "Section 2 – Discharge",     timestamp: "05:45 AM", status: "Resolved" },
    { id: "FMD-005", type: "Bird Droppings",  severity: "Low",    camera: "CAM-R4-01", location: "Section 4 – Roof Zone",     timestamp: "04:20 AM", status: "Resolved" },
    { id: "FMD-006", type: "Metal Ring",      severity: "Medium", camera: "CAM-R1-01", location: "Section 1 – Feed Belt",     timestamp: "03:10 AM", status: "Resolved" },
  ],
  "Mosaic Esterhazy": [
    { id: "FMD-001", type: "Metal Ring",      severity: "High",   camera: "CAM-E3-02", location: "East Wing – Belt 3",        timestamp: "09:55 AM", status: "Active" },
    { id: "FMD-002", type: "Bird Droppings",  severity: "Low",    camera: "CAM-E1-01", location: "East Wing – Overhead",      timestamp: "09:22 AM", status: "Active" },
    { id: "FMD-003", type: "Seeds",           severity: "Low",    camera: "CAM-E2-03", location: "East Wing – Transfer Point",timestamp: "08:05 AM", status: "Active" },
    { id: "FMD-004", type: "Rubber Glove",   severity: "High",   camera: "CAM-E4-01", location: "East Wing – Entry Belt",    timestamp: "07:40 AM", status: "Active" },
    { id: "FMD-005", type: "Belt Fragment",   severity: "Medium", camera: "CAM-E3-04", location: "East Wing – Return Belt",   timestamp: "06:25 AM", status: "Resolved" },
    { id: "FMD-006", type: "Earring",         severity: "High",   camera: "CAM-E2-02", location: "East Wing – Discharge Belt",timestamp: "05:00 AM", status: "Resolved" },
  ],
};

const SITE_CHART_DATA: Record<string, { day: string; accessories: number; beltDebris: number; biological: number }[]> = {
  "Nutrien Allan": [
    { day: "Mon", accessories: 2, beltDebris: 1, biological: 1 },
    { day: "Tue", accessories: 1, beltDebris: 2, biological: 0 },
    { day: "Wed", accessories: 3, beltDebris: 1, biological: 2 },
    { day: "Thu", accessories: 1, beltDebris: 0, biological: 1 },
    { day: "Fri", accessories: 2, beltDebris: 2, biological: 1 },
    { day: "Sat", accessories: 0, beltDebris: 1, biological: 0 },
    { day: "Sun", accessories: 1, beltDebris: 0, biological: 1 },
  ],
  "Nutrien Lanigan": [
    { day: "Mon", accessories: 1, beltDebris: 2, biological: 0 },
    { day: "Tue", accessories: 2, beltDebris: 1, biological: 1 },
    { day: "Wed", accessories: 0, beltDebris: 2, biological: 0 },
    { day: "Thu", accessories: 1, beltDebris: 1, biological: 1 },
    { day: "Fri", accessories: 2, beltDebris: 0, biological: 0 },
    { day: "Sat", accessories: 1, beltDebris: 1, biological: 1 },
    { day: "Sun", accessories: 0, beltDebris: 0, biological: 0 },
  ],
  "Nutrien Cory": [
    { day: "Mon", accessories: 2, beltDebris: 1, biological: 2 },
    { day: "Tue", accessories: 3, beltDebris: 2, biological: 1 },
    { day: "Wed", accessories: 1, beltDebris: 1, biological: 1 },
    { day: "Thu", accessories: 2, beltDebris: 0, biological: 2 },
    { day: "Fri", accessories: 3, beltDebris: 1, biological: 1 },
    { day: "Sat", accessories: 1, beltDebris: 2, biological: 0 },
    { day: "Sun", accessories: 0, beltDebris: 1, biological: 1 },
  ],
  "Nutrien Rocanville": [
    { day: "Mon", accessories: 1, beltDebris: 1, biological: 0 },
    { day: "Tue", accessories: 0, beltDebris: 1, biological: 1 },
    { day: "Wed", accessories: 1, beltDebris: 0, biological: 0 },
    { day: "Thu", accessories: 0, beltDebris: 1, biological: 1 },
    { day: "Fri", accessories: 1, beltDebris: 0, biological: 0 },
    { day: "Sat", accessories: 0, beltDebris: 0, biological: 1 },
    { day: "Sun", accessories: 0, beltDebris: 1, biological: 0 },
  ],
  "Mosaic Esterhazy": [
    { day: "Mon", accessories: 3, beltDebris: 2, biological: 2 },
    { day: "Tue", accessories: 2, beltDebris: 1, biological: 1 },
    { day: "Wed", accessories: 3, beltDebris: 2, biological: 2 },
    { day: "Thu", accessories: 2, beltDebris: 2, biological: 1 },
    { day: "Fri", accessories: 4, beltDebris: 1, biological: 2 },
    { day: "Sat", accessories: 1, beltDebris: 1, biological: 1 },
    { day: "Sun", accessories: 2, beltDebris: 0, biological: 1 },
  ],
};

const SITE_STATS: Record<string, { total: number; active: number; resolved: number; rate: string }> = {
  "Nutrien Allan":      { total: 6, active: 2, resolved: 4, rate: "94%" },
  "Nutrien Lanigan":    { total: 6, active: 2, resolved: 4, rate: "97%" },
  "Nutrien Cory":       { total: 6, active: 3, resolved: 3, rate: "91%" },
  "Nutrien Rocanville": { total: 6, active: 1, resolved: 5, rate: "96%" },
  "Mosaic Esterhazy":   { total: 6, active: 4, resolved: 2, rate: "89%" },
};

const SEV_CLS: Record<string, string> = {
  High:   "text-red-600 bg-red-50 border-red-200",
  Medium: "text-amber-600 bg-amber-50 border-amber-200",
  Low:    "text-emerald-600 bg-emerald-50 border-emerald-200",
};

function sevColors(severity: string) {
  if (severity === "High")   return { box: "#ef4444", glow: "rgba(239,68,68,0.35)" };
  if (severity === "Medium") return { box: "#f59e0b", glow: "rgba(245,158,11,0.35)" };
  return { box: "#10b981", glow: "rgba(16,185,129,0.35)" };
}

// ── CCTV viewport: potash background + contaminant composited via blend modes ──
function CctvViewport({
  meta, boxColor, boxGlow, label, caption, height,
}: {
  meta: TypeMeta;
  boxColor: string;
  boxGlow: string;
  label: string;
  caption: string;
  height?: string;
}) {
  const corners = [
    "top-2 left-2 border-t border-l",
    "top-2 right-2 border-t border-r",
    "bottom-2 left-2 border-b border-l",
    "bottom-2 right-2 border-b border-r",
  ] as const;

  return (
    <div
      className="relative rounded-lg overflow-hidden"
      style={{ height: height ?? "220px", background: "#040404" }}
    >
      {/* Both images share one filter div so CCTV processing is uniform */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ filter: "saturate(0.42) contrast(1.32) brightness(0.76)" }}
      >
        <img src={meta.potashBg} className="absolute inset-0 w-full h-full object-cover" alt="" />
        <img
          src={meta.contaminantUrl}
          alt=""
          style={{
            position: "absolute",
            top: meta.contaminantPlacement.top,
            left: meta.contaminantPlacement.left,
            width: meta.contaminantPlacement.width,
            height: meta.contaminantPlacement.height,
            objectFit: "contain",
            mixBlendMode: meta.contaminantBlend,
            opacity: 0.78,
          }}
        />
      </div>

      {/* Green phosphor overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "rgba(18,55,18,0.20)", mixBlendMode: "screen" }}
      />

      {/* Scan lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.15) 2px,rgba(0,0,0,0.15) 4px)",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,0.6) 100%)" }}
      />

      {/* Corner brackets */}
      {corners.map((cls, i) => (
        <div key={i} className={`absolute w-4 h-4 ${cls} border-green-400/60`} style={{ borderWidth: "1.5px" }} />
      ))}

      {/* Bounding box */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: meta.detectionBox.top,
          left: meta.detectionBox.left,
          width: meta.detectionBox.width,
          height: meta.detectionBox.height,
          border: `1.5px solid ${boxColor}`,
          boxShadow: `0 0 8px ${boxGlow}, inset 0 0 8px ${boxGlow}`,
        }}
      >
        <span
          className="absolute -top-5 left-0 px-1 py-0.5 text-white font-mono"
          style={{ fontSize: "0.6rem", background: boxColor, letterSpacing: "0.05em" }}
        >
          {label}
        </span>
      </div>

      {/* REC badge */}
      <div className="absolute top-2.5 right-9 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-red-400 font-mono" style={{ fontSize: "0.58rem" }}>REC</span>
      </div>

      {/* HUD bar */}
      <div
        className="absolute bottom-0 left-0 right-0 px-2.5 py-1.5 font-mono"
        style={{ background: "rgba(0,0,0,0.55)", fontSize: "0.58rem", color: "rgba(180,220,180,0.85)" }}
      >
        <div className="flex justify-between items-center">
          <span>{caption}</span>
          <span className="opacity-60">CONF: 94%</span>
        </div>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────────
export function ForeignMaterialDetection() {
  const { selectedSite } = useSite();
  const detections = SITE_DETECTIONS[selectedSite];
  const chartData = SITE_CHART_DATA[selectedSite];
  const siteStats = SITE_STATS[selectedSite];

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalDetection, setModalDetection] = useState<Detection | null>(null);

  const activeCount = detections.filter((d) => d.status === "Active").length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-zinc-900">Foreign Material Detection</h2>
          <p className="text-zinc-500" style={{ fontSize: "0.85rem" }}>
            {selectedSite} · Conveyor Camera Network
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-700" style={{ fontSize: "0.78rem", fontWeight: 600 }}>
            {activeCount} Active Alert{activeCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Detections", value: siteStats.total,    color: "text-zinc-900" },
          { label: "Active",           value: siteStats.active,   color: "text-red-600" },
          { label: "Resolved",         value: siteStats.resolved, color: "text-emerald-600" },
          { label: "Detection Rate",   value: siteStats.rate,     color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-zinc-100 shadow-sm p-4">
            <p
              className="text-zinc-400 mb-1"
              style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}
            >
              {s.label}
            </p>
            <p className={`font-bold ${s.color}`} style={{ fontSize: "1.6rem", lineHeight: 1.1 }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Weekly chart — moved above log for at-a-glance context.
          key={selectedSite} forces full Recharts remount on site switch. */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-6">
        <h3 className="text-zinc-800 font-semibold mb-4">Weekly Detection Breakdown</h3>
        <ResponsiveContainer key={selectedSite} width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.8rem" }}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />
            <Legend wrapperStyle={{ fontSize: "0.78rem" }} />
            <Bar dataKey="accessories" name="Operator Accessories" fill="#a78bfa" radius={[3, 3, 0, 0]} />
            <Bar dataKey="beltDebris"  name="Belt Debris"          fill="#64748b" radius={[3, 3, 0, 0]} />
            <Bar dataKey="biological"  name="Biological"           fill="#34d399" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detection log */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="text-zinc-800 font-semibold">Detection Log</h3>
        </div>
        <div className="divide-y divide-zinc-50">
          {detections.map((det) => {
            const { box, glow } = sevColors(det.severity);
            const meta = TYPE_META[det.type];
            const isExpanded = expandedId === det.id;
            return (
              <div key={det.id}>
                <div
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : det.id)}
                >
                  <div className="flex-shrink-0">
                    {det.status === "Active" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-zinc-900" style={{ fontSize: "0.875rem" }}>
                        {det.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${SEV_CLS[det.severity]}`}>
                        {det.severity}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          det.status === "Active" ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {det.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-zinc-400" style={{ fontSize: "0.75rem" }}>
                        <Camera className="w-3 h-3" />
                        {det.camera}
                      </span>
                      <span className="text-zinc-400" style={{ fontSize: "0.75rem" }}>
                        {det.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="flex items-center gap-1 text-zinc-400" style={{ fontSize: "0.75rem" }}>
                      <Clock className="w-3 h-3" />
                      {det.timestamp}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalDetection(det);
                      }}
                      className="p-1.5 rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                      <ZoomIn className="w-3.5 h-3.5 text-zinc-500" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </div>

                {isExpanded && meta && (
                  <div className="px-5 pb-4 bg-zinc-50 border-t border-zinc-100">
                    <div className="mt-3 max-w-md">
                      <CctvViewport
                        meta={meta}
                        boxColor={box}
                        boxGlow={glow}
                        label={det.type.toUpperCase()}
                        caption={`${det.camera}  ${det.timestamp}`}
                        height="240px"
                      />
                    </div>
                    <p className="text-zinc-400 mt-2" style={{ fontSize: "0.72rem" }}>
                      Detection ID: {det.id} · {det.location}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {modalDetection && (() => {
        const meta = TYPE_META[modalDetection.type];
        if (!meta) return null;
        const { box, glow } = sevColors(modalDetection.severity);
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.72)" }}
            onClick={() => setModalDetection(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
                <div>
                  <h4 className="font-semibold text-zinc-900">{modalDetection.type}</h4>
                  <p className="text-zinc-400" style={{ fontSize: "0.75rem" }}>
                    {modalDetection.id} · {modalDetection.camera}
                  </p>
                </div>
                <button
                  onClick={() => setModalDetection(null)}
                  className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>
              <div className="p-5">
                <CctvViewport
                  meta={meta}
                  boxColor={box}
                  boxGlow={glow}
                  label={modalDetection.type.toUpperCase()}
                  caption={`${modalDetection.camera}  ${modalDetection.timestamp}`}
                  height="300px"
                />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { label: "Location",  value: modalDetection.location },
                    { label: "Timestamp", value: modalDetection.timestamp },
                    { label: "Severity",  value: modalDetection.severity },
                    { label: "Status",    value: modalDetection.status },
                  ].map((f) => (
                    <div key={f.label} className="bg-zinc-50 rounded-lg p-3">
                      <p
                        className="text-zinc-400"
                        style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}
                      >
                        {f.label}
                      </p>
                      <p className="text-zinc-800 font-medium mt-0.5" style={{ fontSize: "0.85rem" }}>
                        {f.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
