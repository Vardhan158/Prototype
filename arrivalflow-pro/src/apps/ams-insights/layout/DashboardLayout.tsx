import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";

export function DashboardLayout({ title, children }: { title: string; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-muted/40">
      <Sidebar collapsed={collapsed} onCollapse={() => setCollapsed(true)} />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300",
          collapsed ? "pl-[76px]" : "pl-[76px] lg:pl-[268px]",
        )}
      >
        <Header title={title} onToggleSidebar={() => setCollapsed((c) => !c)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
