import { Link } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { DashboardLayout } from "@/apps/ams-insights/layout/DashboardLayout";
import { PageHeader } from "@/apps/ams-insights/common/PageHeader";
import { Button } from "@/components/ui/button";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <DashboardLayout title={title}>
      <PageHeader title={title} description={description} />
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-10 text-center shadow-card">
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Construction className="size-6" />
        </span>
        <h3 className="mt-4 text-lg font-semibold tracking-tight">Module under construction</h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          This screen is part of the AMS frontend skeleton. Layout, navigation and design system are
          ready — business screens will be built here next.
        </p>
        <Button asChild className="mt-6 rounded-lg">
          <Link to="/ams-insights">Back to Dashboard</Link>
        </Button>
      </div>
    </DashboardLayout>
  );
}
