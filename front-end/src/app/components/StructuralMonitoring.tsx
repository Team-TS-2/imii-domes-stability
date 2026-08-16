import { AlertCircle, CheckCircle, Activity, TrendingUp, TrendingDown, Minus, Zap, Calendar } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceArea, ReferenceLine,
} from "recharts";
import { useSite } from "../context/SiteContext";
import { useState, useMemo, useEffect } from "react";
import { structuralApi } from "../../services/api";

// ─── helpers ────────────────────────────────────────────────────────────────

function linearRegression(values: (number | null)[]): { slope: number; intercept: number } {
  const pts = values
    .map((v, i) => ({ x: i, y: v }))
    .filter((p): p is { x: number; y: number } => p.y !== null);
  const n = pts.length;
  if (n < 2) return { slope: 0, intercept: pts[0]?.y ?? 50 };
  const xMean = pts.reduce((s, p) => s + p.x, 0) / n;
  const yMean = pts.reduce((s, p) => s + p.y, 0) / n;
  const num = pts.reduce((s, p) => s + (p.x - xMean) * (p.y - yMean), 0);
  const den = pts.reduce((s, p) => s + (p.x - xMean) ** 2, 0);
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: yMean - slope * xMean };
}

function getFutureDates(count: number): string[] {
  const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const start = new Date(2026, 2, 29);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return `${M[d.getMonth()]} ${d.getDate()}`;
  });
}

function r1(n: number) { return Math.round(n * 10) / 10; }
function clamp(n: number) { return Math.min(100, Math.max(0, n)); }

const CRITICAL = 75;

// ─── component ──────────────────────────────────────────────────────────────

export function StructuralMonitoring() {
  const { selectedSite } = useSite();
  const [showForecast, setShowForecast] = useState(false);
  const [forecastDays, setForecastDays] = useState<7 | 14 | 30>(7);
  const [structuralData, setStructuralData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStructuralData() {
      try {
        setLoading(true);
        setError(null);
        const data = await structuralApi.getBeams(selectedSite);
        setStructuralData(data);
      } catch (err) {
        console.error('Error fetching structural data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load structural data');
        // Fallback to mock data on error
        setStructuralData({
          totalBeams: 8, healthy: 6, warning: 2,
          beams: [
            { id: "B-01", location: "Barn 1 - North", status: "good",    stress: 45, lastInspection: "2026-03-15" },
            { id: "B-02", location: "Barn 1 - South", status: "good",    stress: 42, lastInspection: "2026-03-15" },
          ],
          stressData: [
            { date: "Mar 22", beam1: 62, beam2: 65, average: 48 },
            { date: "Mar 23", beam1: 64, beam2: 67, average: 49 },
            { date: "Mar 24", beam1: 65, beam2: 68, average: 48 },
            { date: "Mar 25", beam1: 66, beam2: 69, average: 47 },
            { date: "Mar 26", beam1: 67, beam2: 70, average: 48 },
            { date: "Mar 27", beam1: 67, beam2: 71, average: 48 },
            { date: "Mar 28", beam1: 68, beam2: 72, average: 47 },
          ],
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStructuralData();
  }, [selectedSite]);

  const currentData = structuralData || {
    totalBeams: 0, healthy: 0, warning: 0,
    beams: [],
    stressData: [],
  };
  
  const beams = currentData.beams;
  const stressData: Array<{ date: string; beam1: number | null; beam2?: number | null; average: number }> = currentData.stressData;
  const hasBeam2 = currentData.warning > 1;

  // ── Forecast computation ──────────────────────────────────────────────────
  const forecast = useMemo(() => {
    const b1Values = stressData.map(d => d.beam1);
    const b2Values = stressData.map(d => d.beam2);
    const avgValues = stressData.map(d => d.average);

    const b1Reg = linearRegression(b1Values);
    const b2Reg = hasBeam2 ? linearRegression(b2Values) : { slope: 0, intercept: 0 };
    const aReg  = linearRegression(avgValues);

    const histLen = stressData.length; // 7

    const predB1  = (i: number) => r1(clamp(b1Reg.slope * i + b1Reg.intercept));
    const predB2  = (i: number) => hasBeam2 ? r1(clamp(b2Reg.slope * i + b2Reg.intercept)) : null;
    const predAvg = (i: number) => r1(clamp(aReg.slope * i + aReg.intercept));

    const futureDates = getFutureDates(forecastDays);
    const lastIdx = histLen - 1;
    const lastDate = stressData[lastIdx].date;

    // Historical points (all but last)
    const histPoints = stressData.slice(0, lastIdx).map((d, i) => ({
      date: d.date,
      beam1: d.beam1, beam2: d.beam2, average: d.average,
      beam1Pred: null as number | null,
      beam2Pred: null as number | null,
      avgPred:   null as number | null,
    }));

    // Overlap point (last historical = prediction seed, so both lines connect)
    const overlapPt = {
      date: lastDate,
      beam1: stressData[lastIdx].beam1, beam2: stressData[lastIdx].beam2, average: stressData[lastIdx].average,
      beam1Pred: predB1(lastIdx),
      beam2Pred: predB2(lastIdx),
      avgPred:   predAvg(lastIdx),
    };

    // Future prediction points
    const futurePts = futureDates.map((date, i) => {
      const idx = histLen + i;
      return {
        date,
        beam1: null as number | null, beam2: null as number | null, average: null as number | null,
        beam1Pred: predB1(idx),
        beam2Pred: predB2(idx),
        avgPred:   predAvg(idx),
      };
    });

    const combinedData = [...histPoints, overlapPt, ...futurePts];

    // Days-to-critical helper
    const daysToCritical = (reg: { slope: number; intercept: number }) => {
      if (reg.slope <= 0) return null;
      const lastVal = reg.slope * lastIdx + reg.intercept;
      if (lastVal >= CRITICAL) return 0;
      return Math.ceil((CRITICAL - reg.intercept) / reg.slope - lastIdx);
    };

    const predictedAtHorizon = (reg: { slope: number; intercept: number }) =>
      r1(clamp(reg.slope * (histLen - 1 + forecastDays) + reg.intercept));

    const trendLabel = (slope: number) =>
      Math.abs(slope) < 0.05 ? "stable" : slope > 0 ? "rising" : "falling";

    return {
      combinedData,
      futureDates,
      firstFutureDate: futureDates[0],
      lastFutureDate: futureDates[futureDates.length - 1],
      b1: {
        reg: b1Reg,
        current: r1(clamp(b1Reg.slope * lastIdx + b1Reg.intercept)),
        atHorizon: predictedAtHorizon(b1Reg),
        daysToCritical: daysToCritical(b1Reg),
        trend: trendLabel(b1Reg.slope),
        slope: b1Reg.slope,
      },
      b2: hasBeam2 ? {
        reg: b2Reg,
        current: r1(clamp(b2Reg.slope * lastIdx + b2Reg.intercept)),
        atHorizon: predictedAtHorizon(b2Reg),
        daysToCritical: daysToCritical(b2Reg),
        trend: trendLabel(b2Reg.slope),
        slope: b2Reg.slope,
      } : null,
      avg: {
        reg: aReg,
        current: r1(clamp(aReg.slope * lastIdx + aReg.intercept)),
        atHorizon: predictedAtHorizon(aReg),
        trend: trendLabel(aReg.slope),
        slope: aReg.slope,
      },
    };
  }, [selectedSite, forecastDays, hasBeam2]);

  // ── stat cards ────────────────────────────────────────────────────────────
  const statCards = [
    { label: "Total Beams",          value: currentData.totalBeams,  sub: `Across ${Math.ceil(currentData.totalBeams / 2)} barns`, valueClass: "text-zinc-900" },
    { label: "Healthy",              value: currentData.healthy,     sub: "Operating normally",        valueClass: "text-emerald-600" },
    { label: "Requires Inspection",  value: currentData.warning,     sub: "Elevated stress levels",    valueClass: "text-amber-600" },
  ];

  // ── chart data depending on forecast toggle ───────────────────────────────
  const chartData = showForecast ? forecast.combinedData : stressData.map(d => ({
    ...d, beam1Pred: null, beam2Pred: null, avgPred: null,
  }));

  const xTickInterval = forecastDays === 30 ? 4 : forecastDays === 14 ? 2 : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-5 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
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

      {/* Stress Trend + Forecast Chart */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">

        {/* Chart Header */}
        <div className="px-6 pt-5 pb-4 flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-zinc-400" />
            <div>
              <h3 className="text-zinc-800">Stress Level Trends</h3>
              <p className="text-zinc-400 mt-0.5" style={{ fontSize: "0.82rem" }}>
                7-day historical · glue laminated beam readings
                {showForecast && ` + ${forecastDays}-day AI forecast`}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Horizon selector (visible only when forecast is on) */}
            {showForecast && (
              <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg">
                {([7, 14, 30] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setForecastDays(d)}
                    className="px-3 py-1.5 rounded-md transition-all"
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      backgroundColor: forecastDays === d ? "white" : "transparent",
                      color: forecastDays === d ? "#5f352e" : "#71717a",
                      boxShadow: forecastDays === d ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    }}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            )}

            {/* Toggle forecast button */}
            <button
              onClick={() => setShowForecast(v => !v)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all"
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                backgroundColor: showForecast ? "#5f352e" : "#f4f4f5",
                color: showForecast ? "white" : "#3f3f46",
              }}
            >
              <Zap className="w-3.5 h-3.5" />
              {showForecast ? "Hide Forecast" : "Show Forecast"}
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="px-4 pt-4 pb-2">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f5" vertical={false} />

              <XAxis
                dataKey="date"
                stroke="#a1a1aa"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={showForecast ? xTickInterval : 0}
              />
              <YAxis
                stroke="#a1a1aa"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={[30, 85]}
                tickFormatter={(v) => `${v}%`}
              />

              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "0.8rem" }}
                formatter={(value: any) => value !== null ? [`${value}%`, undefined] : [null, undefined]}
              />
              <Legend
                wrapperStyle={{ fontSize: "0.78rem", paddingTop: "12px" }}
                formatter={(value) => (
                  <span style={{ color: "#52525b" }}>{value}</span>
                )}
              />

              {/* Forecast reference area */}
              {showForecast && forecast.futureDates.length > 0 && (
                <ReferenceArea
                  x1={forecast.firstFutureDate}
                  x2={forecast.lastFutureDate}
                  fill="rgba(99,102,241,0.05)"
                  stroke="none"
                />
              )}

              {/* Critical threshold line */}
              <ReferenceLine
                y={CRITICAL}
                stroke="#ef4444"
                strokeDasharray="5 3"
                strokeWidth={1.5}
                label={{ value: "Critical (75%)", position: "insideTopRight", fontSize: 10, fill: "#ef4444", dy: -4 }}
              />

              {/* Forecast boundary line */}
              {showForecast && (
                <ReferenceLine
                  x="Mar 28"
                  stroke="#6366f1"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{ value: "▶ Forecast", position: "top", fontSize: 10, fill: "#6366f1", dy: -6 }}
                />
              )}

              {/* ── Actual lines ── */}
              <Line key="act-b1" type="monotone" dataKey="beam1"   stroke="#f59e0b" strokeWidth={2} name="Beam 1 (Actual)"   dot={false} activeDot={{ r: 4, strokeWidth: 0 }} connectNulls={false} />
              {hasBeam2 && (
                <Line key="act-b2" type="monotone" dataKey="beam2" stroke="#ef4444" strokeWidth={2} name="Beam 2 (Actual)"   dot={false} activeDot={{ r: 4, strokeWidth: 0 }} connectNulls={false} />
              )}
              <Line key="act-avg" type="monotone" dataKey="average" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Fleet Avg (Actual)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} connectNulls={false} />

              {/* ── Forecast lines (only rendered when showForecast) ── */}
              {showForecast && (
                <Line key="pred-b1" type="monotone" dataKey="beam1Pred" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" strokeOpacity={0.75} name="Beam 1 (Forecast)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} connectNulls={false} />
              )}
              {showForecast && hasBeam2 && (
                <Line key="pred-b2" type="monotone" dataKey="beam2Pred" stroke="#ef4444" strokeWidth={2} strokeDasharray="6 3" strokeOpacity={0.75} name="Beam 2 (Forecast)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} connectNulls={false} />
              )}
              {showForecast && (
                <Line key="pred-avg" type="monotone" dataKey="avgPred" stroke="#10b981" strokeWidth={2} strokeDasharray="8 3" strokeOpacity={0.75} name="Fleet Avg (Forecast)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} connectNulls={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend note for forecast */}
        {showForecast && (
          <p className="px-6 pb-4 text-zinc-400" style={{ fontSize: "0.75rem" }}>
            <span className="inline-block w-6 mr-1 border-t-2 border-dashed border-indigo-400 align-middle" />
            Dashed lines indicate AI-generated linear regression forecast · shaded region = forecast horizon
          </p>
        )}
      </div>

      {/* ── Forecast Summary Panel ───────────────────────────────────────── */}
      {showForecast && (
        <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: "#5f352e" }} />
              <div>
                <h3 className="text-zinc-800">Forecast Summary</h3>
                <p className="text-zinc-400 mt-0.5" style={{ fontSize: "0.82rem" }}>
                  AI linear regression · {forecastDays}-day outlook for warning beams
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-indigo-600" style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                Horizon: {forecast.firstFutureDate} → {forecast.lastFutureDate}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className={`grid gap-4 ${hasBeam2 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}>

              {/* Beam 1 card */}
              <ForecastBeamCard
                label={currentData.warningBeamLabels[0] ?? "Beam 1 (Warning)"}
                current={forecast.b1.current}
                atHorizon={forecast.b1.atHorizon}
                daysToCritical={forecast.b1.daysToCritical}
                trend={forecast.b1.trend}
                slope={forecast.b1.slope}
                forecastDays={forecastDays}
                color="#f59e0b"
              />

              {/* Beam 2 card (multi-warning sites) */}
              {hasBeam2 && forecast.b2 && (
                <ForecastBeamCard
                  label={currentData.warningBeamLabels[1] ?? "Beam 2 (Warning)"}
                  current={forecast.b2.current}
                  atHorizon={forecast.b2.atHorizon}
                  daysToCritical={forecast.b2.daysToCritical}
                  trend={forecast.b2.trend}
                  slope={forecast.b2.slope}
                  forecastDays={forecastDays}
                  color="#ef4444"
                />
              )}

              {/* Fleet average card */}
              <ForecastBeamCard
                label="Fleet Average"
                current={forecast.avg.current}
                atHorizon={forecast.avg.atHorizon}
                daysToCritical={null}
                trend={forecast.avg.trend}
                slope={forecast.avg.slope}
                forecastDays={forecastDays}
                color="#10b981"
                isAverage
              />
            </div>

            {/* Model note */}
            <div className="mt-5 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-start gap-3">
              <span className="text-zinc-400 mt-0.5" style={{ fontSize: "1rem" }}>ⓘ</span>
              <p className="text-zinc-500" style={{ fontSize: "0.78rem", lineHeight: 1.6 }}>
                Forecasts are generated using <strong className="text-zinc-700">ordinary least-squares linear regression</strong> on the past 7 days of sensor data.
                Predictions assume current loading and environmental conditions remain constant.
                Use as a planning guide — schedule inspections at least <strong className="text-zinc-700">5 days before</strong> any projected critical threshold crossing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Beam Status Table */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100">
          <h3 className="text-zinc-800">Beam Status</h3>
          <p className="text-zinc-400 mt-0.5" style={{ fontSize: "0.82rem" }}>Real-time structural health of glue laminated beams</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                {["Beam ID", "Location", "Status", "Stress Level", "Last Inspection"].map(h => (
                  <th key={h} className="text-left py-3 px-5 text-zinc-500" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {beams.map((beam: any) => (
                <tr key={beam.id} className={`border-b border-zinc-50 hover:bg-zinc-50 transition-colors ${beam.status === "warning" ? "bg-amber-50/40" : ""}`}>
                  <td className="py-3.5 px-5">
                    <span className="font-mono text-zinc-800" style={{ fontSize: "0.875rem" }}>{beam.id}</span>
                  </td>
                  <td className="py-3.5 px-5 text-zinc-600" style={{ fontSize: "0.875rem" }}>{beam.location}</td>
                  <td className="py-3.5 px-5">
                    {beam.status === "good" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700" style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                        <CheckCircle className="w-3.5 h-3.5" /> Good
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700" style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                        <AlertCircle className="w-3.5 h-3.5" /> Warning
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-zinc-100 rounded-full h-1.5 max-w-[100px]">
                        <div
                          className={`h-1.5 rounded-full transition-all ${beam.stress > 65 ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${beam.stress}%` }}
                        />
                      </div>
                      <span className={`tabular-nums ${beam.stress > 65 ? "text-amber-700" : "text-zinc-600"}`} style={{ fontSize: "0.875rem", fontWeight: beam.stress > 65 ? 600 : 400 }}>
                        {beam.stress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-zinc-500" style={{ fontSize: "0.875rem" }}>{beam.lastInspection}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ForecastBeamCard sub-component ─────────────────────────────────────────

interface ForecastBeamCardProps {
  label: string;
  current: number;
  atHorizon: number;
  daysToCritical: number | null;
  trend: string;
  slope: number;
  forecastDays: number;
  color: string;
  isAverage?: boolean;
}

function ForecastBeamCard({ label, current, atHorizon, daysToCritical, trend, slope, forecastDays, color, isAverage }: ForecastBeamCardProps) {
  const delta = r1(atHorizon - current);
  const isCriticalSoon = daysToCritical !== null && daysToCritical <= forecastDays;
  const alreadyCritical = daysToCritical === 0;

  const TrendIcon = trend === "rising" ? TrendingUp : trend === "falling" ? TrendingDown : Minus;
  const trendColor = trend === "rising" ? "text-red-500" : trend === "falling" ? "text-emerald-500" : "text-zinc-400";

  // Progress bar width for "current" value
  const barWidth = Math.min(100, Math.max(0, current));
  const barColor = current >= CRITICAL ? "#ef4444" : current >= 65 ? "#f59e0b" : "#10b981";

  return (
    <div className="rounded-xl border p-5" style={{ borderColor: isCriticalSoon && !isAverage ? "#fca5a5" : "#e4e4e7", backgroundColor: isCriticalSoon && !isAverage ? "#fff8f8" : "#fafafa" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="text-zinc-700" style={{ fontSize: "0.85rem", fontWeight: 600 }}>{label}</span>
        </div>
        <div className={`flex items-center gap-1 ${trendColor}`} style={{ fontSize: "0.75rem", fontWeight: 600 }}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span className="capitalize">{trend}</span>
        </div>
      </div>

      {/* Stress values */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-2.5 rounded-lg bg-white border border-zinc-200">
          <p className="text-zinc-400 mb-0.5" style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Now</p>
          <p className="text-zinc-900" style={{ fontSize: "1.3rem", fontWeight: 700, lineHeight: 1 }}>{current}<span style={{ fontSize: "0.7rem", fontWeight: 500 }}>%</span></p>
        </div>
        <div className="text-center p-2.5 rounded-lg bg-white border border-zinc-200">
          <p className="text-zinc-400 mb-0.5" style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>In {forecastDays}d</p>
          <p style={{ fontSize: "1.3rem", fontWeight: 700, lineHeight: 1, color: atHorizon >= CRITICAL ? "#ef4444" : atHorizon >= 65 ? "#f59e0b" : "#10b981" }}>
            {atHorizon}<span style={{ fontSize: "0.7rem", fontWeight: 500 }}>%</span>
          </p>
        </div>
      </div>

      {/* Stress bar */}
      <div className="mb-4">
        <div className="relative w-full bg-zinc-200 rounded-full h-2">
          <div className="h-2 rounded-full transition-all" style={{ width: `${barWidth}%`, backgroundColor: barColor }} />
          {/* Threshold marker */}
          <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-red-400 rounded" style={{ left: `${CRITICAL}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-zinc-400" style={{ fontSize: "0.68rem" }}>0%</span>
          <span className="text-red-400" style={{ fontSize: "0.68rem" }}>Critical: {CRITICAL}%</span>
          <span className="text-zinc-400" style={{ fontSize: "0.68rem" }}>100%</span>
        </div>
      </div>

      {/* Rate + CTA */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-zinc-500" style={{ fontSize: "0.78rem" }}>Rate of change</span>
          <span className="tabular-nums" style={{ fontSize: "0.78rem", fontWeight: 600, color: slope > 0.3 ? "#ef4444" : slope > 0.05 ? "#f59e0b" : "#10b981" }}>
            {slope > 0 ? "+" : ""}{r1(slope * 7)}% / week
          </span>
        </div>

        {/* Delta */}
        <div className="flex items-center justify-between">
          <span className="text-zinc-500" style={{ fontSize: "0.78rem" }}>Projected change</span>
          <span className="tabular-nums" style={{ fontSize: "0.78rem", fontWeight: 600, color: delta > 0 ? "#ef4444" : delta < 0 ? "#10b981" : "#71717a" }}>
            {delta > 0 ? "+" : ""}{delta}%
          </span>
        </div>

        {/* Days to critical — only for warning beams */}
        {!isAverage && (
          <div className="mt-3 pt-3 border-t border-zinc-200">
            {alreadyCritical ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-red-600" style={{ fontSize: "0.78rem", fontWeight: 600 }}>Already at critical level — immediate inspection required</span>
              </div>
            ) : isCriticalSoon ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-amber-700" style={{ fontSize: "0.78rem", fontWeight: 600 }}>⚠ Critical threshold in ~{daysToCritical} days — schedule inspection</span>
              </div>
            ) : daysToCritical !== null ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-emerald-700" style={{ fontSize: "0.78rem", fontWeight: 600 }}>Critical threshold in ~{daysToCritical} days at current rate</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-emerald-700" style={{ fontSize: "0.78rem", fontWeight: 600 }}>Not trending toward critical threshold</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
