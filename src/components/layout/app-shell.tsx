"use client";

import {
  Activity,
  BarChart3,
  Bug,
  FolderKanban,
  LayoutDashboard,
  Play,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToastStack } from "@/components/layout/toast-stack";
import { DashboardScreen } from "@/components/dashboard/dashboard-screen";
import { ProjectsScreen } from "@/components/projects/projects-screen";
import { LiveSessionScreen } from "@/components/live/live-session-screen";
import { ReportsScreen } from "@/components/reports/reports-screen";
import { VisualRegressionScreen } from "@/components/visual/visual-regression-screen";
import { AgentLogsScreen } from "@/components/logs/agent-logs-screen";
import { SettingsScreen } from "@/components/settings/settings-screen";
import { useRealtimeSession } from "@/hooks/use-realtime-session";
import { useInspectraStore } from "@/stores/use-inspectra-store";
import { useAuthStore } from "@/stores/use-auth-store";
import { AuthScreen } from "@/components/auth/auth-screen";
import type { NavItem } from "@/types/inspectra";
import { cn } from "@/lib/utils";

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "live", label: "Live Sessions", icon: Play },
  { id: "reports", label: "Reports", icon: Bug },
  { id: "visual", label: "Visual Regression", icon: BarChart3 },
  { id: "logs", label: "Agent Logs", icon: Activity },
  { id: "settings", label: "Settings", icon: Settings },
];

export function AppShell() {
  useRealtimeSession();
  const pathname = usePathname();
  const pushToast = useInspectraStore((state) => state.pushToast);
  const reasoningCursor = useInspectraStore((state) => state.reasoningCursor);
  const currentReasoning = "Preparing autonomous test.";
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <AuthScreen />;
  }

  const activeScreen =
    navItems.find((item) => pathname === `/${item.id}`)?.id ??
    (pathname === "/" ? "dashboard" : "dashboard");

  return (
    <div className="grid h-screen grid-cols-[280px_minmax(0,1fr)_320px] max-[1180px]:grid-cols-[240px_minmax(0,1fr)] max-[860px]:block max-[860px]:h-auto">
      <aside className="flex min-h-0 flex-col border-r border-white/10 bg-[var(--panel)] p-4 backdrop-blur-xl max-[860px]:sticky max-[860px]:top-0 max-[860px]:z-40 max-[860px]:block max-[860px]:border-b max-[860px]:border-r-0">
        <div className="mb-7 flex items-center gap-3 max-[860px]:hidden">
          <div className="grid size-11 place-items-center rounded-lg bg-gradient-to-br from-cyan to-green font-black text-[#061017] shadow-[0_0_36px_rgba(90,215,255,0.32)]">
            I
          </div>
          <div>
            <strong className="block">Inspectra</strong>
            <span className="text-xs text-muted">AI QA Command</span>
          </div>
        </div>

        <nav className="grid gap-1.5 max-[860px]:flex max-[860px]:overflow-x-auto" aria-label="Main navigation">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.id === "dashboard" ? "/" : `/${item.id}`}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg border px-3 text-left text-sm transition max-[860px]:shrink-0",
                  activeScreen === item.id
                    ? "border-cyan/35 bg-cyan/10 text-foreground"
                    : "border-transparent text-muted hover:border-white/10 hover:bg-white/[0.05] hover:text-foreground",
                )}
              >
                <span className="font-mono text-[0.68rem] text-cyan">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto grid gap-3 max-[860px]:hidden">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-green shadow-[0_0_0_6px_rgba(88,230,167,0.08)]" />
              <strong className="text-sm">Inspectra Agent</strong>
            </div>
            <p className="mb-0 text-xs text-muted">Awaiting objective...</p>
          </div>
          <Link
            href="/live"
            onClick={() =>
              pushToast({
                type: "success",
                title: "Quick test started",
                detail: "Inspectra is launching a browser automation session.",
              })
            }
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-cyan/60 bg-gradient-to-r from-cyan to-green px-4 text-sm font-semibold text-[#061017] shadow-[0_0_32px_rgba(90,215,255,0.22)] transition hover:brightness-110"
          >
            <Play className="size-4" />
            Start Test
          </Link>
        </div>
      </aside>

      <main className="min-w-0 overflow-y-auto p-4 max-[860px]:overflow-visible">
        <header className="sticky top-0 z-30 mb-5 flex items-center gap-3 rounded-lg border border-white/10 bg-[var(--panel)] p-3 backdrop-blur-xl max-[860px]:static max-[860px]:flex-col max-[860px]:items-stretch">
          <div className="flex min-h-10 min-w-[190px] items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3">
            <span className="text-xs text-muted">Project</span>
            <strong className="text-sm">Acme Checkout</strong>
          </div>
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              className="min-h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-10 pr-3 text-sm text-foreground placeholder:text-muted"
              placeholder="Find sessions, reports, issues..."
              type="search"
            />
          </label>
          <Link
            href="/live"
            onClick={() =>
              pushToast({
                type: "success",
                title: "AI test started",
                detail: "Running checkout flow and mobile visual checks.",
              })
            }
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-cyan/60 bg-gradient-to-r from-cyan to-green px-4 text-sm font-semibold text-[#061017] shadow-[0_0_32px_rgba(90,215,255,0.22)] transition hover:brightness-110"
          >
            <Sparkles className="size-4" />
            Run AI Test
          </Link>
          <Button variant="icon" aria-label="Profile">
            AR
          </Button>
        </header>

        {activeScreen === "dashboard" && <DashboardScreen />}
        {activeScreen === "projects" && <ProjectsScreen />}
        {activeScreen === "live" && <LiveSessionScreen />}
        {activeScreen === "reports" && <ReportsScreen />}
        {activeScreen === "visual" && <VisualRegressionScreen />}
        {activeScreen === "logs" && <AgentLogsScreen />}
        {activeScreen === "settings" && <SettingsScreen />}
      </main>

      <aside className="border-l border-white/10 bg-[var(--panel)] p-5 backdrop-blur-xl max-[1180px]:hidden">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Current Objective</h2>
          <Badge tone="running">live</Badge>
        </div>
        <p className="text-sm leading-6 text-muted">
          Validate checkout across desktop and mobile, then produce a human-readable bug report.
        </p>

        <div className="mx-auto my-8 grid size-48 place-items-center rounded-full bg-[radial-gradient(circle_at_center,#111823_58%,transparent_60%),conic-gradient(var(--cyan)_0_88%,rgba(255,255,255,0.08)_88%_100%)]">
          <div className="text-center">
            <strong className="block text-4xl">88%</strong>
            <span className="text-xs text-muted">AI confidence</span>
          </div>
        </div>

        <div className="grid gap-3">
          {[
            ["Current action", currentReasoning],
            ["Fallback behavior", "Retry slow iframe, then capture DOM"],
            ["Latest issue", "CTA overlaps footer on mobile"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-3"
            >
              <span className="block text-xs text-muted">{label}</span>
              <strong className="mt-1 block text-sm">{value}</strong>
            </div>
          ))}
        </div>
      </aside>

      <ToastStack />
    </div>
  );
}
