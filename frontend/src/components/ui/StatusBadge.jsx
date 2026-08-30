const STYLES = {
  assigned: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
  in_progress: "bg-blue-50 text-status-inProgress ring-1 ring-inset ring-blue-200",
  submitted: "bg-amber-50 text-status-pending ring-1 ring-inset ring-amber-200",
  reviewed: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  pending: "bg-amber-50 text-status-pending ring-1 ring-inset ring-amber-200",
  open: "bg-slate-100 text-status-open ring-1 ring-inset ring-border",
  overdue: "bg-red-50 text-status-overdue ring-1 ring-inset ring-red-200",
  resolved: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
  verified: "bg-primary-light text-primary ring-1 ring-inset ring-blue-200",
  closed: "bg-green-50 text-status-closed ring-1 ring-inset ring-green-200",
};

const LABELS = {
  assigned: "Assigned",
  in_progress: "In Progress",
  submitted: "Submitted",
  reviewed: "Reviewed",
  pending: "Pending",
  open: "Open",
  overdue: "Overdue",
  resolved: "Resolved (Pending Verification)",
  verified: "Verified",
  closed: "Closed",
};

export default function StatusBadge({ status }) {
  const norm = (status || "assigned").toLowerCase();
  const style = STYLES[norm] || STYLES.open;
  const label = LABELS[norm] || status;
  return <span className={`status-badge ${style}`}>{label}</span>;
}

export function SeverityBadge({ severity }) {
  const norm = (severity || "low").toLowerCase();
  const styles = {
    low: "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    high: "bg-orange-50 text-orange-700 border-orange-200",
    critical: "bg-red-50 text-red-700 border-red-200 animate-pulse font-semibold",
  };
  const style = styles[norm] || styles.low;
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs uppercase tracking-wide font-medium ${style}`}>
      {severity}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const norm = (priority || "medium").toLowerCase();
  const styles = {
    low: "text-slate bg-slate-100 border-slate-200",
    medium: "text-blue-700 bg-blue-50 border-blue-200",
    high: "text-amber-700 bg-amber-50 border-amber-200",
    critical: "text-red-700 bg-red-50 border-red-200 font-semibold",
  };
  const style = styles[norm] || styles.medium;
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs capitalize font-medium ${style}`}>
      {priority}
    </span>
  );
}

export function RiskBadge({ level }) {
  const norm = (level || "low").toLowerCase();
  const styles = {
    low: "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    high: "bg-red-50 text-red-700 border-red-200 font-bold",
  };
  const style = styles[norm] || styles.low;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] uppercase font-bold tracking-wide ${style}`}>
      {level} Risk
    </span>
  );
}

