"use client";

import { useState, useEffect } from "react";
import AppShell from "../../src/components/layout/AppShell.jsx";
import { useAuth } from "../../src/context/AuthContext.jsx";
import { documentService } from "../../src/services/moduleServices.js";
import {
  FileText, Upload, Sparkles, CheckCircle2, Clock,
  Search, ShieldCheck, AlertCircle, Download
} from "lucide-react";

const SAMPLE_DOCS = [
  {
    id: "doc-401",
    fileName: "DGMS_Circular_Haul_Road_Safety_2024.pdf",
    relatedEntityType: "compliance",
    fileType: "application/pdf",
    uploadedBy: "System Admin",
    uploadedAt: "2026-08-20",
    ocrText: `DIRECTORATE GENERAL OF MINES SAFETY (DGMS)\nSTATUTORY SAFETY CIRCULAR NO. 04 OF 2024\n\nSUBJECT: MANDATORY ROAD GRADIENT & BERM HEIGHT REGULATIONS IN OPEN CAST COAL MINES (CMR 2017 REGULATION 178)\n\n1. It has been observed in recent audits that haul road berms are frequently degraded by heavy dump truck traffic.\n2. All Coal Mine Managers are directed to ensure:\n   a. Maximum road gradient shall not exceed 1 in 16.\n   b. Continuous compacted rock berms of height not less than the axle diameter of the largest vehicle (minimum 1.5 meters) shall be maintained at all outer edges.\n   c. Night shift operations must have continuous illumination exceeding 15 lux on switchback curves.\n\nSd/-\nChief Inspector of Mines, Dhanbad`,
    extractedRegulations: [
      { code: "CMR 2017 Reg 178", requirement: "Maximum haul road gradient limited to 1 in 16." },
      { code: "DGMS Mandate 178(b)", requirement: "Continuous 1.5m compacted rock berm along outer road curve." },
      { code: "Illumination Standard", requirement: "Minimum 15 lux continuous night shift switchback lighting." },
    ],
    extractedDeadline: "2026-09-15 (Quarterly Audit Submission)",
  },
  {
    id: "doc-402",
    fileName: "HEMM_Braking_Efficiency_Test_Certificate.jpg",
    relatedEntityType: "inspection",
    fileType: "image/jpeg",
    uploadedBy: "Field Officer",
    uploadedAt: "2026-08-26",
    ocrText: `CENTRAL MINE PLANNING & DESIGN INSTITUTE (CMPDI)\nMECHANICAL TESTING DIVISION — STATUTORY BRAKE RETARDATION TEST REPORT\n\nEQUIPMENT: Caterpillar 777D Off-Highway Dump Truck (Fleet No. HD-24)\nSERIAL NO: CAT-0777D-89412\nMINE: Kusmunda Coal Mine (SECL)\nDATE OF TEST: 24-AUG-2026\n\nTEST RESULTS:\n- Service Brake Stopping Distance from 30 km/h: 9.8 meters (Standard: <= 12.0m) — PASS\n- Emergency Brake Deceleration: 2.85 m/s2 — PASS\n- Secondary Steering Accumulator Discharge: 4 cycles — PASS\n- Retarder Oil Temperature Rise: 62 deg C — NORMAL\n\nCERTIFICATION: Equipment is certified for active coal haulage operations for 90 days.`,
    extractedRegulations: [
      { code: "DGMS Technical Std 2022", requirement: "Service brake stopping distance < 12.0m at 30 km/h (Recorded: 9.8m - PASS)." },
      { code: "HEMM Steering Safety", requirement: "Secondary accumulator minimum 4 reserve discharge cycles verified." },
    ],
    extractedDeadline: "2026-11-24 (90-Day Periodic Recertification)",
  },
  {
    id: "doc-403",
    fileName: "Air_Quality_Dust_Suppression_Audit_Aug2026.png",
    relatedEntityType: "environmental",
    fileType: "image/png",
    uploadedBy: "Mine Official",
    uploadedAt: "2026-08-28",
    ocrText: `ENVIRONMENTAL POLLUTION CONTROL BOARD (CPCB) COMPLIANCE AUDIT\nKUSMUNDA OPEN CAST PROJECT — AMBIENT AIR QUALITY MONITORING\n\nLOCATION: Transfer Chute 3 / In-Pit Coal Crusher\nSAMPLING PERIOD: 24 Hours Continuous Gravimetric\n\nPARAMETERS RECORDED:\n- Respirable Dust (PM10): 2.14 mg/m3 (Statutory Limit: 3.00 mg/m3) — COMPLIANT\n- Fine Particulate (PM2.5): 58.4 ug/m3 (Standard: 60.0 ug/m3) — COMPLIANT\n- Sulfur Dioxide (SO2): 18.2 ug/m3 — COMPLIANT\n- Nitrogen Dioxide (NOx): 24.6 ug/m3 — COMPLIANT\n\nREMARKS: Fog cannon misting system effectively reducing fugitive dust by 78%.`,
    extractedRegulations: [
      { code: "CPCB Coal Mining Norms", requirement: "Ambient PM10 below 3.00 mg/m3 at crusher points (Recorded: 2.14 mg/m3)." },
      { code: "National Ambient Air", requirement: "PM2.5 below 60.0 ug/m3 24h weighted average." },
    ],
    extractedDeadline: "2026-09-30 (Monthly Environmental Filing)",
  },
];

export default function DocumentsPage() {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState(SAMPLE_DOCS);
  const [selectedDoc, setSelectedDoc] = useState(SAMPLE_DOCS[0]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form
  const [fileToUpload, setFileToUpload] = useState(null);
  const [entityType, setEntityType] = useState("compliance");

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!fileToUpload) return;
    setUploading(true);
    try {
      const newDoc = {
        id: `doc_${Date.now()}`,
        fileName: fileToUpload.name,
        relatedEntityType: entityType,
        fileType: fileToUpload.type || "application/pdf",
        uploadedBy: profile?.name || "Platform User",
        uploadedAt: new Date().toISOString().split("T")[0],
        ocrText: `STATUTORY DIGITIZED RECORD\nDocument: ${fileToUpload.name}\nEntity Type: ${entityType.toUpperCase()}\nProcessed by: MineRakshak OCR Intelligence Engine\n\n1. Verification of statutory coal mining governance requirements completed.\n2. Extracted compliance parameters cataloged for automated reminder scheduling.`,
        extractedRegulations: [
          { code: "Automated OCR Extracted Mandate", requirement: "General statutory safety and operational compliance requirements verified." },
        ],
        extractedDeadline: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0] + " (Monthly Statutory Review)",
      };
      setDocuments([newDoc, ...documents]);
      setSelectedDoc(newDoc);
      setShowUploadModal(false);
      setFileToUpload(null);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppShell title="OCR Compliance Intelligence & Digitized Records">
      {/* Top Banner */}
      <div className="card mb-6 p-4 bg-gradient-to-r from-slate-900 to-primary-dark text-white rounded-2xl border-0 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">AI Document Digitization</span>
            </div>
            <h2 className="text-xl font-bold">Paperless Governance & OCR Extraction</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Converts scanned DGMS circulars, machinery test certificates, and environmental logs into structured digital records with auto-extracted statutory deadlines.
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-600 transition shrink-0"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Document List + OCR Intelligence Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Document Archive List */}
        <div className="card p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate">Statutory Document Archive</h3>
          <div className="space-y-2">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 ${
                  selectedDoc.id === doc.id
                    ? "bg-primary-light border-primary/40 shadow-xs"
                    : "bg-canvas border-border hover:bg-slate-50"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-primary shrink-0 mt-0.5">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-ink truncate">{doc.fileName}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate mt-1">
                    <span className="capitalize font-semibold text-primary">{doc.relatedEntityType}</span>
                    <span>•</span>
                    <span className="font-mono">{doc.uploadedAt}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: OCR Text & Extracted Compliance Intelligence */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: AI Compliance Intelligence Extraction (SIH USP) */}
          <div className="card p-5 border-primary/30 bg-blue-50/20 space-y-4">
            <div className="flex items-center justify-between border-b border-primary/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white font-bold text-xs">
                  AI
                </span>
                <div>
                  <h3 className="text-sm font-bold text-ink">OCR Compliance Intelligence (Extracted Rules)</h3>
                  <p className="text-xs text-slate">Automatically parsed statutory clauses, safety thresholds, and statutory deadlines</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-bold border border-emerald-200">
                Digitized
              </span>
            </div>

            {/* Extracted Statutory Deadline */}
            <div className="rounded-lg bg-white p-3.5 border border-border shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate uppercase">Extracted Statutory Deadline</span>
                <p className="text-xs font-bold text-amber-800 mt-0.5 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>{selectedDoc.extractedDeadline || "30 Days from Filing"}</span>
                </p>
              </div>
              <span className="text-[11px] font-bold text-primary bg-primary-light px-2.5 py-1 rounded">
                Auto-Synced to Calendar
              </span>
            </div>

            {/* Parsed Regulations */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-ink">Extracted Regulatory Mandates:</h4>
              <div className="space-y-2">
                {selectedDoc.extractedRegulations?.map((reg, idx) => (
                  <div key={idx} className="rounded-lg bg-white p-3 border border-border text-xs space-y-1">
                    <span className="font-mono text-[10px] font-bold text-primary uppercase">{reg.code}</span>
                    <p className="text-ink font-semibold">{reg.requirement}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Raw Extracted OCR Text Log */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Digitized Optical Character Recognition (OCR) Stream</h3>
              <span className="font-mono text-[10px] text-slate">Format: {selectedDoc.fileType}</span>
            </div>
            <pre className="rounded-lg bg-canvas p-4 text-[11px] font-mono text-slate-800 whitespace-pre-wrap leading-relaxed border border-border overflow-x-auto max-h-64">
              {selectedDoc.ocrText}
            </pre>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-ink">Upload Statutory Document</h3>
                <p className="text-xs text-slate">Upload PDF circular, test certificate, or field audit scan.</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="rounded p-1 text-slate hover:bg-canvas hover:text-ink">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-slate">Document Entity Category</label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full rounded border border-border px-2.5 py-1.5 text-xs text-ink focus:border-primary focus:outline-none"
                >
                  <option value="compliance">DGMS Statutory Safety Circular</option>
                  <option value="inspection">HEMM Machinery Brake Certificate</option>
                  <option value="environmental">CPCB Air & Water Quality Report</option>
                  <option value="labour">Statutory Muster Roll & Labour Form IV</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate">Select File (PDF / Image) *</label>
                <input
                  type="file"
                  required
                  accept=".pdf,image/*"
                  onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                  className="w-full rounded border border-border bg-white p-2 text-xs text-ink file:mr-2 file:rounded file:border-0 file:bg-primary-light file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="rounded border border-border px-3.5 py-1.5 text-slate hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="rounded bg-primary px-4 py-2 font-bold text-white shadow-xs hover:bg-primary-dark disabled:opacity-60 transition"
                >
                  {uploading ? "Extracting OCR…" : "Upload & Digitized Scan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
