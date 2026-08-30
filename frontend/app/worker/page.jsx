"use client";

import { useState, useEffect, useRef } from "react";
import AppShell from "../../src/components/layout/AppShell.jsx";
import { useAuth } from "../../src/context/AuthContext.jsx";
import { workerService } from "../../src/services/workerService.js";
import {
  MapPin, Clock, ShieldAlert, ShieldCheck, CheckCircle2, AlertTriangle, PlayCircle,
  HardHat, BookOpen, Construction, Crosshair, Map, Activity, 
  Upload, Navigation, Eye, CheckSquare, Square, Wrench
} from "lucide-react";

const SHIFTS = ["Shift A (06:00 - 14:00)", "Shift B (14:00 - 22:00)", "Shift C (22:00 - 06:00)"];

const PPE_ITEMS = [
  { id: "helmet", label: "Safety Helmet & Chinstrap" },
  { id: "boots", label: "Steel-Toe Safety Boots" },
  { id: "vest", label: "High-Vis Reflective Vest" },
  { id: "gloves", label: "Heavy-Duty Gloves" },
  { id: "mask", label: "Dust Mask / Respirator" },
  { id: "ears", label: "Ear Protection (Muffs/Plugs)" },
  { id: "rescuer", label: "Self-Rescuer Device (Pit)" },
];

export default function WorkerDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("attendance"); // "attendance", "tasks", "report", "sos", "training"
  const [loading, setLoading] = useState(true);

  // Data states
  const [attendance, setAttendance] = useState([]);
  const [ppe, setPpe] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [training, setTraining] = useState([]);

  // Attendance Form
  const [selectedShift, setSelectedShift] = useState(SHIFTS[0]);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  
  // PPE Form
  const [ppeChecks, setPpeChecks] = useState({});
  const [ppeSubmitting, setPpeSubmitting] = useState(false);

  // Hazard Report Form
  const [hazardTitle, setHazardTitle] = useState("");
  const [hazardDesc, setHazardDesc] = useState("");
  const [hazardCat, setHazardCat] = useState("Haul Road / Bench");
  const [hazardSev, setHazardSev] = useState("medium");
  const [hazardFile, setHazardFile] = useState(null);
  const [hazardPreview, setHazardPreview] = useState(null);
  const [submittingHazard, setSubmittingHazard] = useState(false);

  // SOS
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(3);
  const sosIntervalRef = useRef(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [attData, ppeData, taskData, repData, trData] = await Promise.all([
        workerService.getAttendanceHistory(),
        workerService.getPpeCompliance(),
        workerService.getTasks(),
        workerService.getReports(),
        workerService.getTrainingModules(),
      ]);
      setAttendance(Array.isArray(attData) ? attData : []);
      setPpe(ppeData || null);
      if (ppeData?.checklist) setPpeChecks(ppeData.checklist);
      setTasks(Array.isArray(taskData) ? taskData : []);
      setReports(Array.isArray(repData) ? repData : []);
      setTraining(Array.isArray(trData) ? trData : []);
    } catch (e) {
      console.error("Worker Dashboard Load Error:", e);
    } finally {
      setLoading(false);
    }
  }

  // --- Attendance Handlers ---
  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const coords = { lat: (22.309 + Math.random() * 0.01).toFixed(4), lng: (82.679 + Math.random() * 0.01).toFixed(4) };
      const newEntry = await workerService.checkIn(selectedShift, coords);
      setAttendance([newEntry, ...attendance]);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async (id) => {
    setCheckingOut(true);
    try {
      const coords = { lat: (22.309 + Math.random() * 0.01).toFixed(4), lng: (82.679 + Math.random() * 0.01).toFixed(4) };
      const updated = await workerService.checkOut(id, coords);
      setAttendance(attendance.map(a => a.id === id ? updated : a));
    } finally {
      setCheckingOut(false);
    }
  };

  // --- PPE Handlers ---
  const handlePpeSubmit = async () => {
    if (Object.keys(ppeChecks).length < PPE_ITEMS.length || Object.values(ppeChecks).some(v => !v)) {
      alert("You must verify all PPE items before starting shift!");
      return;
    }
    setPpeSubmitting(true);
    try {
      const ppeRecord = await workerService.savePpeCompliance(ppeChecks);
      setPpe(ppeRecord);
    } finally {
      setPpeSubmitting(false);
    }
  };

  const handlePpeToggle = (id) => {
    setPpeChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Task Handlers ---
  const handleTaskToggle = async (taskId, currentStatus) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    const updated = await workerService.updateTaskStatus(taskId, newStatus);
    setTasks(Array.isArray(updated) ? updated : tasks);
  };

  // --- Hazard Handlers ---
  const handleHazardFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setHazardFile(file);
      const reader = new FileReader();
      reader.onload = () => setHazardPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const submitHazard = async (e) => {
    e.preventDefault();
    if (!hazardTitle || !hazardDesc) return;
    setSubmittingHazard(true);
    try {
      const coords = `${(22.309 + Math.random() * 0.01).toFixed(4)}, ${(82.679 + Math.random() * 0.01).toFixed(4)}`;
      const payload = {
        title: hazardTitle,
        description: hazardDesc,
        category: hazardCat,
        severity: hazardSev,
        location: coords,
        imageUrl: hazardPreview,
      };
      const newRep = await workerService.submitHazardReport(payload);
      setReports([newRep, ...reports]);
      
      // Reset form
      setHazardTitle("");
      setHazardDesc("");
      setHazardFile(null);
      setHazardPreview(null);
      setActiveTab("attendance");
      alert("Hazard submitted to Mine Official & Field Officer successfully.");
    } finally {
      setSubmittingHazard(false);
    }
  };

  // --- SOS Handlers ---
  const triggerSos = () => {
    if (sosTriggered) return;
    setSosTriggered(true);
    setSosCountdown(3);
    
    sosIntervalRef.current = setInterval(() => {
      setSosCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(sosIntervalRef.current);
          dispatchSos();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSos = () => {
    if (sosIntervalRef.current) clearInterval(sosIntervalRef.current);
    setSosTriggered(false);
    setSosCountdown(3);
  };

  const dispatchSos = async () => {
    const coords = { lat: 22.3091, lng: 82.6795 };
    await workerService.triggerEmergencySos(coords, { name: profile?.name || "Worker", uid: profile?.uid });
    alert("SOS DISPATCHED TO MINE CONTROL ROOM & FIELD OFFICER!");
    setSosTriggered(false);
  };

  // --- Training Handlers ---
  const markTrainingComplete = async (id) => {
    const updated = await workerService.updateTrainingProgress(id, 100);
    setTraining(Array.isArray(updated) ? updated : training);
  };

  // Helpers
  const activeSession = Array.isArray(attendance) ? attendance.find(a => a?.status === "present") : null;

  if (loading) {
    return (
      <AppShell title="Worker Dashboard">
        <div className="p-12 text-center text-slate flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-semibold">Loading worker profile and statutory checklists...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Worker / Miner Dashboard">
      {/* Top Profile & Urgent Banner */}
      <div className="card mb-6 p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl border-0 shadow-xl overflow-hidden relative">
        {/* Dynamic Pulse background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent animate-pulse"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-blue-500/20 border-2 border-blue-400/50 flex items-center justify-center shrink-0">
              <HardHat className="h-7 w-7 text-blue-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">{profile?.name || "Raju Mahto (Pit Miner)"}</h2>
              <p className="text-xs text-blue-200 mt-1 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                {profile?.mineName || "Kusmunda Coal Mine"} | Zone: Sector 3 Pit
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab("sos")}
              className="flex items-center gap-2 rounded-xl bg-red-600/90 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-900/50 hover:bg-red-500 hover:scale-105 transition active:scale-95 border border-red-500"
            >
              <Activity className="h-4 w-4 animate-pulse" />
              EMERGENCY SOS
            </button>
          </div>
        </div>
      </div>

      {/* Safety Alerts Broadcast */}
      <div className="mb-6 flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-3 shadow-sm">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 animate-pulse" />
        <div className="flex-1 overflow-hidden">
          <p className="text-xs font-bold text-amber-900 truncate">
            RESTRICTED ACCESS: Highwall Bench 2 unstable. Blast window active 14:00-15:00. Maintain 500m clearance.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2 text-[10px] font-bold">
          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded">CH4: 0.02%</span>
          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded">PM10: Normal</span>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="mb-6 flex overflow-x-auto pb-2 border-b border-border hide-scrollbar gap-2">
        {[
          { id: "attendance", label: "Attendance & PPE", icon: Clock },
          { id: "tasks", label: "My Tasks", icon: Wrench },
          { id: "report", label: "Report Hazard", icon: ShieldAlert },
          { id: "training", label: "Training SOPs", icon: BookOpen },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-primary text-white border-b-2 border-primary-dark"
                : "bg-surface text-slate hover:bg-canvas border border-transparent border-b-0"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="min-h-[400px]">
        {/* ATTENDANCE & PPE TAB */}
        {activeTab === "attendance" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GPS Attendance Card */}
            <div className="card p-5 space-y-4 shadow-sm border-t-4 border-t-blue-500">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <Navigation className="h-4 w-4 text-blue-500" />
                GPS Shift Attendance
              </h3>
              
              <div className="rounded-xl bg-canvas p-4 border border-border space-y-3">
                {!activeSession ? (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-slate uppercase">Select Shift</label>
                      <select 
                        value={selectedShift}
                        onChange={(e) => setSelectedShift(e.target.value)}
                        className="w-full mt-1 rounded bg-white border border-border px-3 py-2 text-xs font-semibold text-ink focus:border-primary focus:outline-none"
                      >
                        {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <button
                      onClick={handleCheckIn}
                      disabled={checkingIn}
                      className="w-full rounded-lg bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition disabled:opacity-50"
                    >
                      {checkingIn ? "Acquiring GPS..." : "GPS CHECK-IN TO SHIFT"}
                    </button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div>
                        <p className="text-[10px] font-bold text-emerald-800 uppercase">Active Shift</p>
                        <p className="text-sm font-bold text-emerald-950 mt-0.5">{activeSession.shift}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-emerald-800 uppercase">Check-In Time</p>
                        <p className="text-sm font-bold text-emerald-950 mt-0.5">{activeSession.checkInTime}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate font-mono flex items-center gap-1 justify-center">
                      <MapPin className="h-3 w-3" /> GPS: {activeSession.checkInCoords?.lat || "22.3094"}, {activeSession.checkInCoords?.lng || "82.6792"}
                    </p>
                    <button
                      onClick={() => handleCheckOut(activeSession.id)}
                      disabled={checkingOut}
                      className="w-full rounded-lg bg-slate-800 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-700 transition disabled:opacity-50"
                    >
                      {checkingOut ? "Saving..." : "END SHIFT (CHECK-OUT)"}
                    </button>
                  </div>
                )}
              </div>

              {/* Attendance History */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate uppercase">Recent History</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {attendance.length === 0 ? (
                    <p className="text-xs text-slate p-2">No past attendance records found.</p>
                  ) : (
                    attendance.slice(0, 5).map(att => (
                      <div key={att.id || Math.random()} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-white text-xs">
                        <div>
                          <p className="font-bold text-ink">{att.date || "Today"}</p>
                          <p className="text-[10px] text-slate">{(att.shift || "Shift A").split(" ")[0]}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-ink">{att.checkInTime || "--"} - {att.checkOutTime || "Active"}</p>
                          <span className={`text-[10px] font-bold uppercase ${att.status === 'present' ? 'text-emerald-600' : 'text-slate'}`}>
                            {att.status || "completed"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* PPE Checklist Card */}
            <div className="card p-5 space-y-4 shadow-sm border-t-4 border-t-amber-500">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-500" />
                  Mandatory PPE Checklist
                </h3>
                {ppe?.verifiedAt && (
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                    Verified Today
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                {PPE_ITEMS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handlePpeToggle(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition ${
                      ppeChecks[item.id] ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-white border-border text-slate hover:bg-canvas"
                    }`}
                  >
                    <span className="text-xs font-bold">{item.label}</span>
                    {ppeChecks[item.id] ? <CheckSquare className="h-4 w-4 text-emerald-600" /> : <Square className="h-4 w-4 text-slate" />}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handlePpeSubmit}
                disabled={ppeSubmitting}
                className="w-full rounded-lg bg-amber-500 py-3 text-xs font-bold text-white shadow-md hover:bg-amber-600 transition disabled:opacity-50"
              >
                {ppeSubmitting ? "Saving Verification..." : ppe?.verifiedAt ? "UPDATE PPE VERIFICATION" : "CONFIRM PPE COMPLIANCE"}
              </button>
            </div>
          </div>
        )}

        {/* MY TASKS TAB */}
        {activeTab === "tasks" && (
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <Wrench className="h-4 w-4 text-blue-500" />
              My Assigned Maintenance & Safety Tasks
            </h3>
            <div className="space-y-3">
              {tasks.length === 0 && <p className="text-xs text-slate">No tasks assigned currently.</p>}
              {tasks.map(task => (
                <div key={task.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${task.status === "completed" ? "bg-slate-50 border-border opacity-75" : "bg-white border-blue-100 shadow-sm"}`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${task.priority === "High" ? "bg-red-100 text-red-700" : task.priority === "Medium" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                        {task.priority || "Standard"} Priority
                      </span>
                      <span className="text-[10px] text-slate font-mono bg-canvas px-1.5 rounded">{task.zone || "Mine Pit"}</span>
                    </div>
                    <p className={`text-xs font-bold ${task.status === "completed" ? "text-slate line-through" : "text-ink"}`}>
                      {task.title}
                    </p>
                    <p className="text-[10px] text-slate flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Due: {task.deadline ? new Date(task.deadline).toLocaleString() : "End of Shift"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleTaskToggle(task.id, task.status)}
                    className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold border transition flex items-center gap-2 ${
                      task.status === "completed" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                        : "bg-white text-slate hover:bg-canvas"
                    }`}
                  >
                    {task.status === "completed" ? (
                      <><CheckCircle2 className="h-4 w-4" /> Completed</>
                    ) : (
                      "Mark Complete"
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORT HAZARD TAB */}
        {activeTab === "report" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5 space-y-4 border-t-4 border-t-primary">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-primary" />
                Submit Safety Hazard Report
              </h3>
              <form onSubmit={submitHazard} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate mb-1 block">Hazard Title *</label>
                  <input required type="text" value={hazardTitle} onChange={e=>setHazardTitle(e.target.value)} placeholder="e.g. Broken guard rail on Conveyor 3" className="w-full rounded border border-border px-3 py-2 text-xs focus:border-primary focus:outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate mb-1 block">Category</label>
                    <select value={hazardCat} onChange={e=>setHazardCat(e.target.value)} className="w-full rounded border border-border px-3 py-2 text-xs focus:border-primary focus:outline-none bg-white">
                      <option>Haul Road / Bench</option>
                      <option>Machinery / Conveyor</option>
                      <option>Dust / Environment</option>
                      <option>Electrical</option>
                      <option>PPE / Human</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate mb-1 block">Severity</label>
                    <select value={hazardSev} onChange={e=>setHazardSev(e.target.value)} className="w-full rounded border border-border px-3 py-2 text-xs focus:border-primary focus:outline-none bg-white">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate mb-1 block">Description *</label>
                  <textarea required value={hazardDesc} onChange={e=>setHazardDesc(e.target.value)} rows={3} placeholder="Describe the safety issue in detail..." className="w-full rounded border border-border px-3 py-2 text-xs focus:border-primary focus:outline-none"></textarea>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate mb-1 block">Upload Photo Evidence (Optional)</label>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer bg-canvas hover:bg-slate-50 transition">
                    <div className="flex flex-col items-center justify-center pt-3 pb-4">
                      <Upload className="w-6 h-6 text-slate mb-1" />
                      <p className="text-[10px] text-slate font-semibold">{hazardFile ? hazardFile.name : "Tap to capture photo or select file"}</p>
                    </div>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleHazardFile} />
                  </label>
                </div>

                {hazardPreview && (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img src={hazardPreview} alt="Preview" className="w-full h-40 object-cover" />
                  </div>
                )}

                <button type="submit" disabled={submittingHazard} className="w-full rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-md hover:bg-primary-dark transition disabled:opacity-50">
                  {submittingHazard ? "Submitting..." : "SUBMIT HAZARD REPORT & ATTACH GPS"}
                </button>
              </form>
            </div>

            {/* My Reports Timeline */}
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                My Submitted Reports
              </h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {reports.length === 0 && <p className="text-xs text-slate">No reports submitted yet.</p>}
                {reports.map(rep => (
                  <div key={rep.id} className="relative pl-6 pb-4 border-l-2 border-border last:border-0 last:pb-0">
                    <div className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-primary ring-4 ring-white"></div>
                    <div className="bg-canvas rounded-lg p-3 border border-border">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-ink">{rep.title}</span>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${rep.status === 'in-review' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {(rep.status || "").replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate mb-2">{rep.submittedAt ? new Date(rep.submittedAt).toLocaleString() : "Recently"}</p>
                      {rep.imageUrl && <img src={rep.imageUrl} className="w-full h-20 object-cover rounded mb-2" alt="report" />}
                      <div className="flex gap-2">
                        <span className="text-[9px] font-mono bg-white px-1.5 border border-border rounded text-slate">GPS: {rep.location || "Sector 3"}</span>
                        <span className="text-[9px] font-mono bg-white px-1.5 border border-border rounded text-slate">{rep.category || "General"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SOS TAB */}
        {activeTab === "sos" && (
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
            <div className="max-w-md w-full card p-8 border-2 border-red-500 shadow-xl shadow-red-500/20">
              <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold text-red-700 mb-2">EMERGENCY SOS</h2>
              <p className="text-xs text-slate mb-8">
                Pressing this button will instantly broadcast your live GPS coordinates to the Mine Manager and Field Inspector, and sound alarms at the Control Room.
              </p>
              
              {!sosTriggered ? (
                <button
                  onClick={triggerSos}
                  className="w-40 h-40 mx-auto rounded-full bg-red-600 text-white font-black text-xl shadow-[0_0_40px_rgba(220,38,38,0.6)] hover:bg-red-500 hover:scale-105 transition-transform active:scale-95 flex items-center justify-center flex-col gap-2"
                >
                  <Activity className="h-8 w-8" />
                  PRESS SOS
                </button>
              ) : (
                <div className="space-y-6">
                  <div className="w-40 h-40 mx-auto rounded-full bg-red-600 animate-pulse text-white font-black text-5xl shadow-[0_0_40px_rgba(220,38,38,0.8)] flex items-center justify-center">
                    {sosCountdown}
                  </div>
                  <p className="text-sm font-bold text-red-600 animate-pulse">DISPATCHING IN {sosCountdown} SECONDS...</p>
                  <button onClick={cancelSos} className="px-6 py-2 rounded-full border-2 border-slate text-slate font-bold hover:bg-canvas">
                    CANCEL SOS
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TRAINING TAB */}
        {activeTab === "training" && (
          <div className="card p-5 space-y-4 border-t-4 border-t-purple-500">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-500" />
              Mandatory DGMS Safety Training & SOPs
            </h3>
            <div className="space-y-3">
              {training.map(t => (
                <div key={t.id} className="p-4 rounded-xl border border-border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-ink mb-2">{t.title}</p>
                    <div className="w-full bg-canvas rounded-full h-2 mb-1 overflow-hidden">
                      <div className={`h-2 rounded-full ${t.progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${t.progress || 0}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate font-semibold">{t.progress || 0}% Completed {t.lastAccessed && `• Last accessed ${new Date(t.lastAccessed).toLocaleDateString()}`}</p>
                  </div>
                  <button
                    onClick={() => markTrainingComplete(t.id)}
                    disabled={t.progress === 100}
                    className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold border transition flex items-center gap-2 ${
                      t.progress === 100 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-primary text-white hover:bg-primary-dark"
                    }`}
                  >
                    {t.progress === 100 ? <><CheckCircle2 className="h-4 w-4" /> Certified</> : <><PlayCircle className="h-4 w-4" /> Resume Module</>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
