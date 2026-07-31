import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Warehouse, Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NexusWMS — Enterprise Warehouse Management" },
      {
        name: "description",
        content:
          "NexusWMS gate entry and arrival management console for warehouse managers: verify trucks, assign docks and start receiving.",
      },
      { property: "og:title", content: "NexusWMS — Enterprise Warehouse Management" },
      {
        property: "og:description",
        content: "Digital truck arrival, dock assignment and receiving for enterprise distribution centres.",
      },
    ],
  }),
  component: Splash,
});

const steps = ["Initialising secure session", "Syncing gate entry queue", "Loading dock topology", "Ready"];

function Splash() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(6);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 7);
        setStep(Math.min(steps.length - 1, Math.floor(next / 27)));
        return next;
      });
    }, 130);
    const done = setTimeout(() => navigate({ to: "/login" }), 2400);
    return () => {
      clearInterval(t);
      clearTimeout(done);
    };
  }, [navigate]);

  return (
    <div className="surface-mesh relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      <svg className="pointer-events-none absolute inset-0 size-full opacity-[0.35]" aria-hidden>
        <defs>
          <pattern id="grid" width="46" height="46" patternUnits="userSpaceOnUse">
            <path d="M46 0H0V46" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <div className="relative z-10 flex flex-col items-center text-center animate-fade-up">
        <div className="grid size-20 place-items-center rounded-3xl bg-primary text-primary-foreground shadow-glow">
          <Warehouse className="size-9" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">NexusWMS</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Warehouse Management &amp; Asset Management Suite — Gate Entry &amp; Arrival Module
        </p>

        <div className="mt-9 w-[280px] overflow-hidden rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          {steps[step]}
        </p>
      </div>

      <div className="absolute bottom-8 text-center text-[11px] text-muted-foreground">
        <p className="font-medium">Version 4.2.0 · Build 20260731</p>
        <p className="mt-1">© 2026 Nexus Supply Chain Systems · Pune Distribution Centre</p>
      </div>
    </div>
  );
}
