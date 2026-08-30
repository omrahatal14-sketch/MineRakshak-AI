"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../src/context/AuthContext.jsx";
import {
  ShieldAlert, Camera, MapPin, FileText, CheckCircle2, ClipboardCheck,
  TrendingUp, Clock, Users, ArrowRight, ShieldCheck, Wrench,
  Building2, HardHat, Compass, Sparkles, LogIn, Flame,
  Mountain, Waves, Wind, Truck, CircleAlert, Eye, ChevronRight, Activity
} from "lucide-react";

const criticalHazards = [
  { title: "Gas & coal dust explosions", label: "Critical consequence", icon: Flame, tone: "red", summary: "Methane buildup and suspended coal dust can turn a local ignition into a mine-wide chain reaction.", risks: ["Firedamp accumulation", "Secondary dust explosion"], control: "Monitor methane, airflow, ignition sources, and dust suppression." },
  { title: "Structural & tunnel collapses", label: "High consequence", icon: Mountain, tone: "amber", summary: "Weak roof strata, undersized pillars, and deep-earth stress can cause sudden ground failure.", risks: ["Roof and wall falls", "Pillar failures & rockbursts"], control: "Track strata condition, support integrity, and extraction limits." },
  { title: "Inundation & flooding", label: "Rapid escalation", icon: Waves, tone: "blue", summary: "Unexpected water ingress can quickly block evacuation routes and overwhelm underground workings.", risks: ["Breaching flooded workings", "Aquifer breaches"], control: "Verify surveys, water barriers, pumping capacity, and escape plans." },
  { title: "Atmospheric hazards & fires", label: "Life-critical", icon: Wind, tone: "violet", summary: "Ventilation loss, oxygen displacement, and underground fires can create invisible lethal conditions.", risks: ["Blackdamp asphyxiation", "Spontaneous combustion"], control: "Continuously measure oxygen, carbon monoxide, ventilation, and heat." },
  { title: "Mechanical & haulage accidents", label: "Operational danger", icon: Truck, tone: "slate", summary: "Heavy equipment in confined, low-visibility spaces can derail, crush, or entrap personnel.", risks: ["Conveyor and car failures", "Equipment entrapment"], control: "Inspect guarding, braking, routes, and isolation procedures." },
];

export default function LandingPage() {
  const { profile, loginAsDemo } = useAuth();
  const router = useRouter();

  const handleQuickLaunch = async (roleKey) => {
    const user = await loginAsDemo(roleKey);
    const destination =
      user.role === "field_officer"
        ? "/field-officer"
        : user.role === "mine_official"
        ? "/mine-official"
        : user.role === "contractor"
        ? "/contractor"
        : user.role === "corporate"
        ? "/corporate"
        : "/admin";
    router.push(destination);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col selection:bg-primary-light selection:text-primary">
      {/* 1. Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-bold text-sm shadow-md">
              MR
            </div>
            <div>
              <span className="font-bold text-sm text-ink leading-none">MineRakshak AI</span>
              <span className="block text-[10px] text-slate font-medium">Smart Coal Mine Governance</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate">
            <a href="#hazards" className="hover:text-primary transition">Critical Hazards</a>
            <a href="#features" className="hover:text-primary transition">Innovation USPs</a>
            <a href="#roles" className="hover:text-primary transition">Stakeholder Personas</a>
            <a href="#workflow" className="hover:text-primary transition">Closed-Loop Workflow</a>
          </div>

          <div className="flex items-center gap-2.5">
            {profile ? (
              <Link
                href={
                  profile.role === "field_officer"
                    ? "/field-officer"
                    : profile.role === "mine_official"
                    ? "/mine-official"
                    : profile.role === "contractor"
                    ? "/contractor"
                    : profile.role === "corporate"
                    ? "/corporate"
                    : "/admin"
                }
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-dark transition"
              >
                <span>Dashboard ({profile.role})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-dark transition"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In / Launch</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative px-4 sm:px-6 pt-16 pb-20 max-w-6xl mx-auto w-full text-center">
        {/* National Initiative Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-light px-3.5 py-1 text-xs font-bold text-primary mb-6 shadow-xs animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Ministry of Coal • Smart Governance Initiative</span>
        </div>

        <p className="text-xs font-mono font-bold uppercase tracking-widest text-primary mb-2">
          From Reactive Compliance to Predictive Mine Governance
        </p>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-ink max-w-4xl mx-auto leading-tight sm:leading-tight">
          AI-Based Smart Governance & Compliance Platform for Coal Mines
        </h1>

        <p className="mt-4 text-xs sm:text-sm text-slate max-w-2xl mx-auto leading-relaxed">
          Make risk visible before it becomes an incident. MineRakshak connects underground operations, DGMS safety tracking, AI-assisted alerts, corrective action workflows, and paperless compliance intelligence.
        </p>

        {/* Hero Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-white shadow-lg hover:bg-primary-dark transition"
          >
            <span>Launch Platform Portal</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/map"
            className="flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-xs font-semibold text-ink shadow-xs hover:bg-slate-50 transition"
          >
            <MapPin className="h-4 w-4 text-primary" />
            <span>Interactive GIS Mine Map</span>
          </Link>
        </div>

        {/* Live System Stat Bar */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-left animate-stagger">
          <div className="stat-card rounded-xl border border-border bg-surface p-3.5 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate">Monitored Facilities</span>
            <p className="text-lg font-bold text-ink mt-0.5">10 Coal Mines</p>
            <p className="text-[10px] text-slate">SECL, WCL, BCCL, ECL</p>
          </div>

          <div className="stat-card rounded-xl border border-border bg-surface p-3.5 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate">AI Hazard Vision</span>
            <p className="text-lg font-bold text-primary mt-0.5">Automatic Dispatch</p>
            <p className="text-[10px] text-slate">Inspector & Contractor alerts</p>
          </div>

          <div className="stat-card rounded-xl border border-border bg-surface p-3.5 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate">CAPA Workflow</span>
            <p className="text-lg font-bold text-emerald-600 mt-0.5">Closed-Loop</p>
            <p className="text-[10px] text-slate">5-stage statutory closure</p>
          </div>

          <div className="stat-card rounded-xl border border-border bg-surface p-3.5 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate">Audit Trail</span>
            <p className="text-lg font-bold text-ink mt-0.5">Tamper-Evident</p>
            <p className="text-[10px] text-slate">Immutable timestamped logs</p>
          </div>
        </div>
      </section>


      <section id="hazards" className="relative overflow-hidden border-y border-slate-200 bg-slate-950 px-4 py-16 text-white sm:px-6">
        <div className="hazard-glow absolute inset-0 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-sky-200"><Activity className="h-3.5 w-3.5" /> Critical incident intelligence</div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Recognize the incidents that demand the fastest response.</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">Use these risk profiles to focus inspections, telemetry, and corrective actions on the conditions that can escalate without warning.</p>
            </div>
            <Link href="/login" className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-sky-200 transition hover:text-white">Open safety workspace <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" /></Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-stagger">
            {criticalHazards.map(({ title, label, icon: Icon, tone, summary, risks, control }) => (
              <article key={title} className={`hazard-card hazard-${tone} group rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm`}>
                <div className="flex items-start justify-between gap-3"><div className={`hazard-icon hazard-icon-${tone} flex h-11 w-11 items-center justify-center rounded-xl`}><Icon className="h-5 w-5" strokeWidth={2} /></div><span className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-300">{label}</span></div>
                <h3 className="mt-5 text-base font-bold text-white">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">{summary}</p>
                <div className="mt-4 space-y-2 border-t border-white/10 pt-4">{risks.map((risk) => <div key={risk} className="flex items-center gap-2 text-xs font-medium text-slate-200"><CircleAlert className="h-3.5 w-3.5 shrink-0 text-slate-400" />{risk}</div>)}</div>
                <div className="mt-4 flex gap-2 rounded-lg bg-black/15 p-2.5 text-[11px] leading-relaxed text-sky-100"><Eye className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>{control}</span></div>
              </article>
            ))}
            <Link href="/map" className="hazard-card group flex min-h-[280px] flex-col justify-between rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-5 transition hover:border-sky-300 hover:bg-white/[0.08]"><div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-400/10 text-sky-200"><MapPin className="h-5 w-5" /></div><h3 className="mt-5 text-base font-bold">Map hazards to the workface</h3><p className="mt-2 text-xs leading-relaxed text-slate-300">Pair field observations with location, inspection history, and live risk context in the GIS workspace.</p></div><span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-200">View GIS mine map <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></Link>
          </div>
        </div>
      </section>

      {/* 3. 5 Stakeholder Personas Section */}
      <section id="roles" className="px-4 sm:px-6 py-16 bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Role-Based Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
              Integrated Multi-Stakeholder Governance
            </h2>
            <p className="text-xs text-slate mt-2">
              Five tailored dashboards providing real-time visibility, automated workflows, and data-driven insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Persona 1: Mine Official */}
            <div className="rounded-2xl border border-border bg-canvas p-5 flex flex-col justify-between hover:border-purple-300 hover:shadow-md transition group">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 mb-3">
                  <HardHat className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-ink">Mine Official (Manager)</h3>
                <p className="text-xs text-slate mt-1.5 leading-relaxed">
                  Captures site incident photos with AI Hazard Vision, triggers automated multi-party dispatch, and tracks active pit non-conformances.
                </p>
              </div>
              <button
                onClick={() => handleQuickLaunch("mine_official")}
                className="mt-5 w-full rounded-lg bg-purple-50 text-purple-700 font-bold text-xs py-2 hover:bg-purple-100 transition flex items-center justify-center gap-1"
              >
                <span>Launch Mine Official</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Persona 2: Field Officer */}
            <div className="rounded-2xl border border-border bg-canvas p-5 flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition group">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 mb-3">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-ink">Field Officer (Inspector)</h3>
                <p className="text-xs text-slate mt-1.5 leading-relaxed">
                  Conducts geo-tagged mobile audits with GPS time-stamping, logs observations, and physically verifies resolved contractor CAPAs.
                </p>
              </div>
              <button
                onClick={() => handleQuickLaunch("field_officer")}
                className="mt-5 w-full rounded-lg bg-blue-50 text-blue-700 font-bold text-xs py-2 hover:bg-blue-100 transition flex items-center justify-center gap-1"
              >
                <span>Launch Field Inspector</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Persona 3: Contractor Company */}
            <div className="rounded-2xl border border-border bg-canvas p-5 flex flex-col justify-between hover:border-orange-300 hover:shadow-md transition group">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700 mb-3">
                  <Wrench className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-ink">Contractor Company (Repair)</h3>
                <p className="text-xs text-slate mt-1.5 leading-relaxed">
                  Receives AI-dispatched repair work orders with risk scores, statutory deadlines with countdown timers, and uploads repair completion proofs.
                </p>
              </div>
              <button
                onClick={() => handleQuickLaunch("contractor")}
                className="mt-5 w-full rounded-lg bg-orange-50 text-orange-700 font-bold text-xs py-2 hover:bg-orange-100 transition flex items-center justify-center gap-1"
              >
                <span>Launch Contractor</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Persona 4: Corporate HQ */}
            <div className="rounded-2xl border border-border bg-canvas p-5 flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition group">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mb-3">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-ink">Corporate Management (HQ)</h3>
                <p className="text-xs text-slate mt-1.5 leading-relaxed">
                  Monitors multi-mine AI inspection rankings, tracks contractor SLA deadlines, and exports statutory compliance reports.
                </p>
              </div>
              <button
                onClick={() => handleQuickLaunch("corporate")}
                className="mt-5 w-full rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs py-2 hover:bg-emerald-100 transition flex items-center justify-center gap-1"
              >
                <span>Launch Corporate HQ</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Persona 5: System Admin */}
            <div className="rounded-2xl border border-border bg-canvas p-5 flex flex-col justify-between hover:border-red-300 hover:shadow-md transition group">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700 mb-3">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-ink">System Administrator</h3>
                <p className="text-xs text-slate mt-1.5 leading-relaxed">
                  Manages user roles, registers coal mine facilities, and audits immutable statutory governance logs across the entire ecosystem.
                </p>
              </div>
              <button
                onClick={() => handleQuickLaunch("admin")}
                className="mt-5 w-full rounded-lg bg-red-50 text-red-700 font-bold text-xs py-2 hover:bg-red-100 transition flex items-center justify-center gap-1"
              >
                <span>Launch System Admin</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Platform Innovations */}
      <section id="features" className="px-4 sm:px-6 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Core Innovations</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
            Platform Intelligence Capabilities
          </h2>
          <p className="text-xs text-slate mt-2">
            6 specialized intelligence modules advancing statutory mining governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="card p-5 space-y-2 border hover:border-primary/40 transition">
            <div className="flex items-center gap-2 font-bold text-sm text-ink">
              <TrendingUp className="h-4 w-4 text-red-600" />
              <span>Predictive Compliance</span>
            </div>
            <p className="text-xs text-slate leading-relaxed">
              Predicts potential compliance failures using historical violation patterns and generates early alerts for proactive preventive maintenance.
            </p>
          </div>

          <div className="card p-5 space-y-2 border hover:border-primary/40 transition">
            <div className="flex items-center gap-2 font-bold text-sm text-ink">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>Explainable Risk Analysis (XAI)</span>
            </div>
            <p className="text-xs text-slate leading-relaxed">
              Shows <strong>why</strong> a mine or pit is high-risk by breaking down exact contributing risk factors rather than relying on a black-box score.
            </p>
          </div>

          <div className="card p-5 space-y-2 border hover:border-primary/40 transition">
            <div className="flex items-center gap-2 font-bold text-sm text-ink">
              <Compass className="h-4 w-4 text-blue-600" />
              <span>Smart Inspection Prioritization</span>
            </div>
            <p className="text-xs text-slate leading-relaxed">
              AI automatically identifies and ranks high-risk mines requiring immediate regulatory inspections based on risk telemetry.
            </p>
          </div>

          <div className="card p-5 space-y-2 border hover:border-primary/40 transition">
            <div className="flex items-center gap-2 font-bold text-sm text-ink">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Closed-Loop Corrective Action</span>
            </div>
            <p className="text-xs text-slate leading-relaxed">
              Tracks the full lifecycle from AI hazard detection to company remediation, AI deadline enforcement, inspector verification, and final closure.
            </p>
          </div>

          <div className="card p-5 space-y-2 border hover:border-primary/40 transition">
            <div className="flex items-center gap-2 font-bold text-sm text-ink">
              <MapPin className="h-4 w-4 text-amber-600" />
              <span>Mine-Wise Risk Visualization</span>
            </div>
            <p className="text-xs text-slate leading-relaxed">
              Interactive GIS map displaying all 10 Indian coal mines with risk heat coding, zone telemetry, and active violations for faster decisions.
            </p>
          </div>

          <div className="card p-5 space-y-2 border hover:border-primary/40 transition">
            <div className="flex items-center gap-2 font-bold text-sm text-ink">
              <FileText className="h-4 w-4 text-primary" />
              <span>OCR Compliance Intelligence</span>
            </div>
            <p className="text-xs text-slate leading-relaxed">
              Converts scanned DGMS circulars and certificates into digital records, auto-extracting statutory regulations and filing deadlines.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="mt-auto border-t border-border bg-surface px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-white font-bold text-[10px]">
              MR
            </span>
            <span className="font-bold text-ink">MineRakshak AI</span>
            <span>• Ministry of Coal & DGMS Statutory Governance Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>National Mining Safety Portal</span>
            <span>•</span>
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Access Portal &rarr;
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
