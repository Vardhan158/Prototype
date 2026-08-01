import { createFileRoute } from "@tanstack/react-router";
import { Globe, KeyRound, LogOut, Moon, ShieldCheck, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/apps/gatepass-pro/components/wms/AppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useWms } from "@/apps/gatepass-pro/lib/wms/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/gatepass-pro/profile")({
  head: () => ({
    meta: [
      { title: "Officer Profile — GateFlow WMS" },
      { name: "description", content: "Security officer profile with shift details, dark mode, language, offline mode and logout." },
      { property: "og:title", content: "Officer Profile — GateFlow WMS" },
      { property: "og:description", content: "Manage your gate officer profile, appearance and offline settings." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { officer, theme, toggleTheme, online, setOnline } = useWms();
  const { logout } = useAuth();

  return (
    <AppShell title="Profile" subtitle={officer.empId} back="/gatepass-pro">
      <div className="card-elevated mb-4 flex items-center gap-4 p-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
          AD
        </span>
        <div className="min-w-0">
          <p className="text-lg font-bold">{officer.name}</p>
          <p className="text-xs text-muted-foreground">Security Officer · {officer.empId}</p>
          <p className="text-xs text-muted-foreground">{officer.shift}</p>
        </div>
      </div>

      <div className="card-elevated mb-4 grid gap-2 p-4 text-sm">
        {[
          ["Warehouse", officer.warehouse],
          ["Assigned gate", officer.gate],
          ["Role", "Security Officer (Gate Entry)"],
          ["App version", "v3.4.1 (2608)"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <span className="text-muted-foreground">{k}</span>
            <span className="text-right font-medium">{v}</span>
          </div>
        ))}
      </div>

      <div className="card-elevated mb-4 divide-y">
        <label className="flex items-center gap-3 p-4">
          <Moon className="size-5 text-muted-foreground" />
          <span className="flex-1 text-sm font-medium">Dark mode</span>
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
        </label>
        <label className="flex items-center gap-3 p-4">
          <WifiOff className="size-5 text-muted-foreground" />
          <span className="flex-1 text-sm font-medium">Offline mode (queue &amp; auto sync)</span>
          <Switch checked={!online} onCheckedChange={(v) => setOnline(!v)} />
        </label>
        <button
          className="flex w-full items-center gap-3 p-4 text-left"
          onClick={() => toast.info("Language: English (India)", { description: "Hindi & Marathi packs available" })}
        >
          <Globe className="size-5 text-muted-foreground" />
          <span className="flex-1 text-sm font-medium">Language</span>
          <span className="text-xs text-muted-foreground">English (IN)</span>
        </button>
        <button
          className="flex w-full items-center gap-3 p-4 text-left"
          onClick={() => toast.success("Password reset link sent to HR portal")}
        >
          <KeyRound className="size-5 text-muted-foreground" />
          <span className="flex-1 text-sm font-medium">Change password</span>
        </button>
        <button
          className="flex w-full items-center gap-3 p-4 text-left"
          onClick={() => toast.info("Biometric unlock is enabled for this device")}
        >
          <ShieldCheck className="size-5 text-muted-foreground" />
          <span className="flex-1 text-sm font-medium">Security &amp; biometrics</span>
        </button>
      </div>

      <Button
        variant="outline"
        className="mb-4 h-14 w-full rounded-2xl border-destructive text-destructive"
        onClick={() => {
          toast.success("Signed out");
          logout();
        }}
      >
        <LogOut className="size-5" /> Logout
      </Button>
    </AppShell>
  );
}
