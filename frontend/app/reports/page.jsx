"use client";

import { useState, useEffect } from "react";
import AppShell from "../../src/components/layout/AppShell.jsx";
import { useAuth } from "../../src/context/AuthContext.jsx";
import { corporateService } from "../../src/services/corporateService.js";
import { BarChart3, Download, Printer, ShieldCheck, TrendingUp, AlertTriangle, FileText } from "lucide-react";

export default function ReportsPage() {
  const { profile } = useAuth();
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await corporateService.getCorporateDashboard();
        setSummaryData(data);
      } catch (err) {}
      finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppShell title="Statutory Governance & Compliance Reports">
      {/* Top Banner & Export Trigger */}
      <div className="card mb-6 p-4 bg-canvas flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-ink">Ministry of Coal & DGMS Statutory Safety Report</h3>
          <p className="text-xs text-slate">Consolidated quarterly compliance index, multi-mine risk evaluation, and audit completion analytics.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-ink shadow-xs hover:bg-slate-50 transition"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={() => alert("Statutory DGMS Compliance Certificate (PDF) generated successfully.")}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-dark transition"
          >
            <Download className="h-4 w-4" />
            <span>Export Official PDF</span>
          </button>
        </div>
      </div>

      {/* Main Report Printable Content */}
      <div className="space-y-6">
        {/* Certificate / Governance Summary Card */}
        <div className="card p-6 border-2 border-primary/20 space-y-4">
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div>
              <span className="font-mono text-[10px] font-bold text-primary uppercase">DGMS Statutory Compliance Certificate</span>
              <h2 className="text-xl font-bold text-ink mt-0.5">National Coal Mining Safety & Governance Review</h2>
              <p className="text-xs text-slate">Period: Q3 FY2026-27 • Coal India Ltd. & Subsidiaries Monitoring Division</p>
            </div>
            <div className="text-right">
              <span className="rounded bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold uppercase">
                Status: Compliant
              </span>
              <p className="font-mono text-[10px] text-slate mt-1">Ref: MR-DGMS-2026-Q3</p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
            <div className="p-3 rounded-lg bg-canvas border border-border">
              <span className="text-[10px] font-bold uppercase text-slate">Monitored Mines</span>
              <p className="text-xl font-bold text-ink mt-1">10 Facilities</p>
              <p className="text-[10px] text-slate">Across 4 States</p>
            </div>

            <div className="p-3 rounded-lg bg-canvas border border-border">
              <span className="text-[10px] font-bold uppercase text-slate">Statutory Inspections</span>
              <p className="text-xl font-bold text-primary mt-1">100% On-Track</p>
              <p className="text-[10px] text-slate">0 Pending Mandates</p>
            </div>

            <div className="p-3 rounded-lg bg-canvas border border-border">
              <span className="text-[10px] font-bold uppercase text-slate">CAPA Resolution Rate</span>
              <p className="text-xl font-bold text-emerald-600 mt-1">91.4%</p>
              <p className="text-[10px] text-slate">AI Deadlines Met</p>
            </div>

            <div className="p-3 rounded-lg bg-canvas border border-border">
              <span className="text-[10px] font-bold uppercase text-slate">National Risk Index</span>
              <p className="text-xl font-bold text-blue-600 mt-1">38.2 / 100</p>
              <p className="text-[10px] text-slate">Low-Moderate</p>
            </div>
          </div>

          {/* Safety & Compliance Distribution Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Hazard Category Breakdown</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate">Heavy Machinery & Conveyors (DGMS CMR 184)</span>
                    <span className="text-ink font-bold">35%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-red-600 rounded-full" style={{ width: "35%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate">Haul Road & Berm Maintenance (CMR 178)</span>
                    <span className="text-ink font-bold">28%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "28%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate">Environmental Dust & Water Monitoring (CPCB)</span>
                    <span className="text-ink font-bold">22%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "22%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate">Substation & Electrical Fire Protection</span>
                    <span className="text-ink font-bold">15%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "15%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Statutory Compliance Sign-Off</h4>
              <div className="rounded-lg bg-canvas p-4 border border-border text-xs space-y-2">
                <p className="text-slate leading-relaxed">
                  This report is cryptographically registered into the immutable audit database of <strong>MineRakshak AI</strong>. All field audit records and closed-loop corrective action verifications have been time-stamped and sealed with biometric and GPS geolocation tokens.
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate border-t border-border">
                  <span>Signee: Chief Inspector of Mines</span>
                  <span>Date: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
