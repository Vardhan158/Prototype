import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Factory, Lock, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAms } from "@/lib/ams/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — AMS Assembly Management" },
      {
        name: "description",
        content:
          "Sign in to the AMS Assembly Management module to manage assembly work orders, stages and quality checkpoints.",
      },
      { property: "og:title", content: "Sign in — AMS Assembly Management" },
      {
        property: "og:description",
        content: "Secure access to the Assembly Management module of the Enterprise AMS.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAms();
  const auth = useAuth();
  const navigate = useNavigate();
  const [userId, setUserId] = useState("admin@nexuswms.com");
  const [password, setPassword] = useState("Admin@2026");
  const [error, setError] = useState("");

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-primary-soft p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Factory className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">AMS</p>
            <p className="text-xs text-muted-foreground">Enterprise Asset Management System</p>
          </div>
        </div>
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold tracking-tight text-primary-deep">
            Assembly Management
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Work order creation, BOM association, component consumption, stage tracking, in-process
            quality checkpoints, assembly confirmation, rework and scrap, finished goods serials,
            exception handling and completion certificates.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">Section 14.9 · BR-079 to BR-088</p>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm surface-card p-8">
          <h1 className="text-xl font-semibold text-foreground">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Access the Assembly Management module.
          </p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!userId.trim() || !password.trim()) {
                setError("User ID and password are required.");
                return;
              }
              const account = auth.login(userId, password);
              if (!account) { setError("Invalid credentials or no Work Craft Flow access."); return; }
              setError("");
              login(account.name);
              navigate({ to: "/" });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="userId"
                  className="pl-9"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="a.fernandes"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
          <p className="mt-5 text-xs text-muted-foreground">Admin: admin@nexuswms.com / Admin@2026</p>
        </div>
      </div>
    </div>
  );
}
