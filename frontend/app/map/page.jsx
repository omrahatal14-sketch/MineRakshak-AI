"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import AppShell from "../../src/components/layout/AppShell.jsx";
const FullMap = dynamic(() => import("../../src/components/maps/FullMap.jsx"), { ssr: false });
import { inspectionService } from "../../src/services/inspectionService.js";
import { corporateService } from "../../src/services/corporateService.js";
import StatusBadge, { RiskBadge } from "../../src/components/ui/StatusBadge.jsx";
import { MapPin, ShieldAlert, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

const DEFAULT_MINES_GEO = [
  { id: "KCM-01", name: "Kusmunda Coal Mine", code: "KCM-01", zone: "Chhattisgarh", latitude: 22.309, longitude: 82.679, riskScore: 88.0, riskLevel: "high", complianceRate: 78, openViolations: 3, overdueActions: 1, riskExplanation: "Critical conveyor mesh guard missing & Pit 2 highwall crest tension fracture." },
  { id: "GCM-02", name: "Gevra Open Cast Mine", code: "GCM-02", zone: "Chhattisgarh", latitude: 22.331, longitude: 82.591, riskScore: 74.0, riskLevel: "high", complianceRate: 82, openViolations: 1, overdueActions: 1, riskExplanation: "Fugitive haul road dust suppression deficiency." },
  { id: "JCM-03", name: "Jharia Underground Coal Mine", code: "JCM-03", zone: "Jharkhand", latitude: 23.739, longitude: 86.414, riskScore: 62.0, riskLevel: "medium", complianceRate: 88, openViolations: 0, overdueActions: 0, riskExplanation: "Methane and CO optical gas detector calibration pending." },
  { id: "MCM-04", name: "Mugma Coal Mine", code: "MCM-04", zone: "Jharkhand", latitude: 23.694, longitude: 86.150, riskScore: 34.0, riskLevel: "low", complianceRate: 94, openViolations: 0, overdueActions: 0, riskExplanation: "All statutory DGMS inspections up-to-date." },
  { id: "KOR-05", name: "Korba Coal Field", code: "KOR-05", zone: "Chhattisgarh", latitude: 22.085, longitude: 82.195, riskScore: 42.0, riskLevel: "medium", complianceRate: 89, openViolations: 0, overdueActions: 0, riskExplanation: "Heavy machinery pre-shift logbooks verified." },
  { id: "UMR-06", name: "Umrer Open Cast Mine", code: "UMR-06", zone: "Maharashtra", latitude: 21.826, longitude: 79.080, riskScore: 28.0, riskLevel: "low", complianceRate: 96, openViolations: 0, overdueActions: 0, riskExplanation: "Zero critical hazards recorded this quarter." },
  { id: "SNG-07", name: "Singrauli Coal Basin", code: "SNG-07", zone: "Madhya Pradesh", latitude: 23.270, longitude: 81.972, riskScore: 45.0, riskLevel: "medium", complianceRate: 90, openViolations: 0, overdueActions: 0, riskExplanation: "Overland conveyor pull-wire trip alarms compliant." },
  { id: "JAY-08", name: "Jayant Open Cast Project", code: "JAY-08", zone: "Madhya Pradesh", latitude: 24.186, longitude: 83.801, riskScore: 38.0, riskLevel: "medium", complianceRate: 91, openViolations: 0, overdueActions: 0, riskExplanation: "CPCB ambient particulate air quality within standard." },
  { id: "DIP-09", name: "Dipka Mine Expansion", code: "DIP-09", zone: "Chhattisgarh", latitude: 22.098, longitude: 82.770, riskScore: 52.0, riskLevel: "medium", complianceRate: 86, openViolations: 1, overdueActions: 0, riskExplanation: "Haul road switchback curve berm height under construction." },
  { id: "WCL-10", name: "Nagpur Coal Division", code: "WCL-10", zone: "Maharashtra", latitude: 21.190, longitude: 79.390, riskScore: 24.0, riskLevel: "low", complianceRate: 98, openViolations: 0, overdueActions: 0, riskExplanation: "Statutory Form IV workman muster verified." },
];

export default function GisMapPage() {
  const [mines, setMines] = useState(DEFAULT_MINES_GEO);
  const [selectedMine, setSelectedMine] = useState(DEFAULT_MINES_GEO[0]);

  useEffect(() => {
    async function loadData() {
      try {
        const corpData = await corporateService.getCorporateDashboard();
        if (corpData?.minesSummary && corpData.minesSummary.length > 0) {
          const merged = corpData.minesSummary.map((m) => {
            const fallback = DEFAULT_MINES_GEO.find((f) => f.id === m.id) || {};
            return { ...fallback, ...m };
          });
          setMines(merged);
          setSelectedMine(merged[0]);
        }
      } catch (err) {}
    }
    loadData();
  }, []);

  return (
    <AppShell title="GIS Mine-Wise Risk & Compliance Visualization">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-170px)] min-h-[550px]">
        {/* Left 2 Cols: Interactive Leaflet Map */}
        <div className="lg:col-span-2 card p-0 overflow-hidden relative shadow-md">
          <FullMap mines={mines} onSelectMine={(m) => setSelectedMine(m)} />
        </div>

        {/* Right Col: Selected Facility Inspector & XAI Breakdown */}
        <div className="card p-5 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <span className="font-mono text-[10px] font-bold text-slate uppercase">Facility Telemetry</span>
              <h3 className="text-base font-bold text-ink">{selectedMine.name}</h3>
              <p className="text-xs text-slate font-mono">{selectedMine.code} • {selectedMine.zone}</p>
            </div>
            <RiskBadge level={selectedMine.riskLevel || "low"} />
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-canvas p-3 border border-border">
              <span className="text-[10px] text-slate font-bold uppercase">AI Risk Index</span>
              <p className="text-lg font-mono font-bold text-red-600 mt-0.5">{selectedMine.riskScore}/100</p>
            </div>
            <div className="rounded-lg bg-canvas p-3 border border-border">
              <span className="text-[10px] text-slate font-bold uppercase">Compliance Rate</span>
              <p className="text-lg font-mono font-bold text-emerald-600 mt-0.5">{selectedMine.complianceRate}%</p>
            </div>
            <div className="rounded-lg bg-canvas p-3 border border-border">
              <span className="text-[10px] text-slate font-bold uppercase">Open Hazards</span>
              <p className="text-base font-bold text-ink mt-0.5">{selectedMine.openViolations || 0}</p>
            </div>
            <div className="rounded-lg bg-canvas p-3 border border-border">
              <span className="text-[10px] text-slate font-bold uppercase">Overdue CAPA</span>
              <p className="text-base font-bold text-amber-700 mt-0.5">{selectedMine.overdueActions || 0}</p>
            </div>
          </div>

          {/* Geo Coordinates */}
          <div className="rounded-lg bg-slate-50 p-3 border border-border text-xs space-y-1">
            <span className="text-[10px] font-bold text-slate uppercase">GPS Coordinates</span>
            <p className="font-mono text-ink font-semibold">
              {selectedMine.latitude?.toFixed(4)}° N, {selectedMine.longitude?.toFixed(4)}° E
            </p>
          </div>

          {/* Explainable Risk Factor */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-1.5">Explainable Risk Analysis (XAI)</h4>
            <div className="rounded-lg bg-blue-50/70 p-3 border border-blue-100 text-xs text-blue-950 leading-relaxed">
              {selectedMine.riskExplanation || "Historical inspection data and real-time hazard detection telemetry evaluated within standard bounds."}
            </div>
          </div>

          {/* Facility List Selector */}
          <div className="pt-2 border-t border-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate mb-2">Switch Coal Mine:</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {mines.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMine(m)}
                  className={`w-full text-left p-2 rounded-lg text-xs font-medium transition flex items-center justify-between border ${
                    selectedMine.id === m.id
                      ? "bg-primary-light border-primary/40 text-primary font-bold"
                      : "bg-canvas border-transparent text-slate hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">{m.name}</span>
                  <span className={`font-mono text-[10px] font-bold ${m.riskLevel === "high" ? "text-red-600" : "text-slate"}`}>
                    {m.riskScore}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
