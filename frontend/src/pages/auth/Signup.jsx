import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const MINES = [
  { id: "KCM-01", name: "Kusmunda Coal Mine (Chhattisgarh)" },
  { id: "GCM-02", name: "Gevra Coal Mine (Chhattisgarh)" },
  { id: "JCF-03", name: "Jharia Coalfield (Jharkhand)" },
  { id: "other", name: "Other Mine / Regional Zone" },
];

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("field_officer");
  const [mineId, setMineId] = useState("KCM-01");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await signup({
        email,
        password,
        name: name.trim(),
        role,
        mineId: ["field_officer", "mine_official"].includes(role) ? mineId : null,
      });
      navigate("/", { replace: true });
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Please sign in.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please use a stronger password.");
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white shadow-md">
            MR
          </div>
          <h1 className="mt-3 text-xl font-bold tracking-tight text-ink">MineRakshak AI</h1>
          <p className="mt-1 text-xs text-slate">Smart Governance & Compliance Monitoring Platform</p>
        </div>

        {/* Card */}
        <div className="card shadow-md">
          <div className="mb-6 flex border-b border-border">
            <Link
              to="/login"
              className="w-1/2 border-b-2 border-transparent pb-3 text-center text-sm font-medium text-slate hover:text-ink"
            >
              Sign In
            </Link>
            <button
              type="button"
              className="w-1/2 border-b-2 border-primary pb-3 text-center text-sm font-semibold text-primary"
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border border-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Ramesh Kumar"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="ramesh.kumar@coalindia.demo"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate">
                System Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded border border-border bg-white px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="field_officer">Field Officer (Ground Inspections)</option>
                <option value="mine_official">Mine Official (Mine Operations)</option>
                <option value="corporate">Corporate Management (Enterprise HQ)</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>

            {["field_officer", "mine_official"].includes(role) && (
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate">
                  Assigned Mine Location
                </label>
                <select
                  value={mineId}
                  onChange={(e) => setMineId(e.target.value)}
                  className="w-full rounded border border-border bg-white px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {MINES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded border border-border bg-white px-3.5 py-2.5 pr-10 text-sm text-ink placeholder:text-slate/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate hover:text-ink focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded border border-border bg-white px-3.5 py-2.5 pr-10 text-sm text-ink placeholder:text-slate/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Repeat your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate hover:text-ink focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-xs text-status-overdue">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded bg-primary py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 transition"
            >
              {submitting ? "Registering account…" : "Create Account"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
