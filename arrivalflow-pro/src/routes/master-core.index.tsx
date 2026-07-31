import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/apps/master-core/Dashboard";

export const Route = createFileRoute("/master-core/")({ component: Dashboard });
