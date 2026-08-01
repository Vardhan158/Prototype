import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Fingerprint, Loader2, LockKeyhole, Shield, User } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth";
import truckGate from "@/assets/truck-gate.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Security Login | WMS & AMS" },
      {
        name: "description",
        content: "Secure role-based employee login for the WMS and AMS platform.",
      },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !pw) {
      setError("Employee ID and password are both required.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const account = login(id, pw);
      if (!account) {
        setError("Invalid employee ID/email or password.");
        return;
      }
      toast.success(`Welcome back, ${account.name}`, {
        description: `Opening the ${account.role} dashboard`,
      });
      navigate({ to: account.dashboard as never });
    }, 450);
  }

  return (
    <div
      className="relative min-h-dvh overflow-hidden bg-[#071426] bg-cover bg-center px-4 py-8 text-white sm:grid sm:place-items-center"
      style={{ backgroundImage: `linear-gradient(180deg, rgb(4 17 34 / 92%), rgb(4 17 34 / 94%)), url(${truckGate})` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgb(37_99_235_/_16%),transparent_42%)]" />

      <main className="relative mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[430px] flex-col justify-center">
        <header className="mb-9 text-center">
          <div className="mx-auto grid size-24 place-items-center rounded-[1.75rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur">
            <Shield className="size-12 text-[#5da2ff]" strokeWidth={2.3} />
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight">WMS &amp; AMS</h1>
          <p className="mt-2 text-sm font-bold tracking-[0.24em] text-[#5da2ff]">SECURITY MANAGEMENT SYSTEM</p>
        </header>

        <form onSubmit={submit} className="rounded-[2rem] bg-[#f8fafc] p-7 text-[#101b31] shadow-2xl sm:p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Security Login</h2>
            <p className="mt-2 text-base text-slate-500">Enter your credentials to continue</p>
          </div>

          <div className="mt-7 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-600">Employee ID / Email</span>
              <span className="relative block">
                <User className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="Enter Employee ID or email"
                  autoComplete="username"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-100/80 pl-12 pr-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 flex items-center justify-between text-sm font-bold text-slate-600">
                Password
                <button
                  type="button"
                  onClick={() => toast.info("Contact your administrator to reset the password.")}
                  className="font-bold text-blue-600"
                >
                  Forgot?
                </button>
              </span>
              <span className="relative block">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                <input
                  type={show ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-100/80 pl-12 pr-12 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShow((value) => !value)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center text-slate-400"
                >
                  {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </span>
            </label>

            <label className="flex items-center gap-3 text-sm font-semibold text-slate-600">
              <Checkbox defaultChecked className="size-5 rounded-md border-slate-300" /> Remember Me
            </label>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 text-sm font-extrabold tracking-[0.12em] text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-70"
            >
              {loading ? <Loader2 className="size-5 animate-spin" /> : <LockKeyhole className="size-5" />}
              {loading ? "AUTHENTICATING" : "LOGIN"}
            </button>

            <button
              type="button"
              onClick={() => toast.info("Fingerprint login is available on registered security devices.")}
              className="flex h-11 w-full items-center justify-center gap-3 text-sm font-bold text-blue-600"
            >
              <Fingerprint className="size-6" /> Login with Fingerprint
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-[11px] font-bold tracking-[0.24em] text-white/80">
          UNAUTHORIZED ACCESS PROHIBITED
        </p>
      </main>
    </div>
  );
}
