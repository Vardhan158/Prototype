import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Warehouse, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SEEDED_USERS, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · NexusWMS Warehouse Console" },
      { name: "description", content: "Secure employee sign-in for the NexusWMS gate entry and arrival management console." },
      { property: "og:title", content: "Sign in · NexusWMS Warehouse Console" },
      { property: "og:description", content: "Secure employee sign-in for warehouse gate entry and arrival management." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [id, setId] = useState("admin@nexuswms.com");
  const [pw, setPw] = useState("Admin@2026");
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
      if (!account) { setError("Invalid employee ID/email or password."); return; }
      toast.success(`Welcome back, ${account.name}`, { description: `Opening the ${account.role} dashboard` });
      navigate({
        to: account.dashboard as never,
      });
    }, 450);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="surface-mesh relative hidden flex-col justify-between overflow-hidden bg-secondary p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
            <Warehouse className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">NexusWMS</p>
            <p className="text-[11px] text-muted-foreground">Warehouse &amp; Asset Management Suite</p>
          </div>
        </div>

        <div className="relative">
          <svg viewBox="0 0 520 300" className="w-full max-w-xl" aria-hidden>
            <rect x="20" y="120" width="300" height="130" rx="10" className="fill-card stroke-border" strokeWidth="2" />
            <path d="M20 120 L170 46 L320 120" className="fill-primary-soft stroke-primary" strokeWidth="2" />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={44 + i * 72} y={182} width="54" height="68" rx="6" className="fill-muted stroke-border" strokeWidth="2" />
            ))}
            <rect x="342" y="168" width="128" height="58" rx="8" className="fill-primary" />
            <rect x="450" y="140" width="52" height="86" rx="8" className="fill-primary/70" />
            <circle cx="376" cy="238" r="14" className="fill-foreground/80" />
            <circle cx="470" cy="238" r="14" className="fill-foreground/80" />
            <rect x="352" y="182" width="44" height="10" rx="3" className="fill-primary-foreground/80" />
            <line x1="0" y1="252" x2="520" y2="252" className="stroke-border" strokeWidth="3" />
          </svg>
          <h2 className="mt-8 max-w-md text-3xl font-semibold leading-tight tracking-tight">
            From gate barrier to putaway — one continuous digital chain of custody.
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Average gate-to-dock time reduced by 38% across 14 distribution centres this quarter.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-success" />
          SOC 2 Type II · ISO 27001 · Single sign-on enforced
        </div>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 lg:hidden">
            <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
              <Warehouse className="size-6" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in to NexusWMS</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Your assigned role controls which Nexus modules you can access.</p>

          <div className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="empid">Employee ID or email</Label>
              <Input id="empid" value={id} onChange={(e) => setId(e.target.value)} placeholder="EMP-00000 or name@company.com" className="h-11 rounded-xl" autoComplete="username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw">Password</Label>
              <div className="relative">
                <Input
                  id="pw"
                  type={show ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="h-11 rounded-xl pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label="Toggle password visibility"
                  className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-accent"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-destructive/25 bg-danger-soft px-3 py-2 text-xs font-medium text-destructive">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox defaultChecked /> Remember me
              </label>
              <button
                type="button"
                onClick={() => toast.info("Reset link sent", { description: "Check your plant mailbox for instructions." })}
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl text-sm font-semibold shadow-glow">
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "Authenticating…" : "Sign In"}
            </Button>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Choose a demo role below or enter assigned credentials.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {SEEDED_USERS.map((account) => (
              <button key={account.id} type="button" onClick={() => { setId(account.email); setPw(account.password); setError(""); }} className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-left transition hover:border-primary/40 hover:bg-primary-soft">
                <span className="block text-[11px] font-semibold">{account.role}</span>
                <span className="block truncate text-[10px] text-muted-foreground">{account.email}</span>
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
