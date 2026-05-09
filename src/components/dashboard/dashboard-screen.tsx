"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { Activity, AlertTriangle, Bot, CheckCircle2, Gauge, Play } from "lucide-react";
import { AiCommandInput } from "@/components/ai/ai-command-input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/use-inspectra-data";
export function DashboardScreen() {
  const [mounted, setMounted] = useState(false);
  const { data, isLoading } = useDashboardData();
  
  const dashboardStatistics = data?.statistics;
  const dashboardAgents = data?.activeSessions ?? [];
  const dashboardActivities = data?.recentActivity ?? [];
  const dashboardTrend: any[] = [];
  const dashboardSeverity: any[] = [];
  
  const kpis = [
    { 
      label: "Tests Run", 
      value: dashboardStatistics?.testsRunToday?.toString() ?? "0", 
      detail: "Total for today", 
      icon: Play, 
      tone: "success" 
    },
    { 
      label: "Pass Rate", 
      value: `${dashboardStatistics?.passRate ?? 100}%`, 
      detail: "Calculated from completed sessions", 
      icon: CheckCircle2, 
      tone: "success" 
    },
    { 
      label: "Active Agents", 
      value: dashboardStatistics?.activeSessions?.toString() ?? "0", 
      detail: "Autonomous browser threads", 
      icon: Bot, 
      tone: "running" 
    },
    { 
      label: "Critical Issues", 
      value: dashboardStatistics?.criticalIssues?.toString() ?? "0", 
      detail: "Found across all projects", 
      icon: AlertTriangle, 
      tone: "error" 
    },
    { 
      label: "AI Confidence", 
      value: `${dashboardStatistics?.aiConfidenceScore ?? 0}%`, 
      detail: "Aggregated reasoning accuracy", 
      icon: Gauge, 
      tone: "warning" 
    },
  ] as const;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <section aria-labelledby="dashboard-title">
      <div className="mb-5 flex items-end justify-between gap-4 max-[700px]:block">
        <div>
          <p className="mb-1 font-mono text-xs uppercase text-cyan">Overview</p>
          <h1 id="dashboard-title" className="text-5xl font-black leading-none tracking-normal max-[700px]:text-4xl">
            AI testing activity
          </h1>
        </div>
        <Badge tone="running" className="max-[700px]:mt-3">3 agents active</Badge>
      </div>

      <div className="grid gap-4">
        <AiCommandInput />

        <div className="grid grid-cols-5 gap-3 max-[1180px]:grid-cols-3 max-[760px]:grid-cols-1">
          {isLoading ? Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-36" />
          )) : kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <motion.article
                key={kpi.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-lg border border-white/10 bg-white/[0.045] p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted">{kpi.label}</span>
                  <Icon className="size-4 text-cyan" />
                </div>
                <strong className="block text-3xl">{kpi.value}</strong>
                <span className="mt-2 block text-xs text-muted">{kpi.detail}</span>
              </motion.article>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-4 max-[980px]:grid-cols-1">
          <Card className="p-4">
            <CardHeader className="mb-4">
              <CardTitle>Live Agent Status</CardTitle>
              <Badge tone="running">streaming</Badge>
            </CardHeader>
            <div className="grid gap-3">
              {dashboardAgents.length === 0 ? (
                <div className="p-8 text-center text-muted text-xs italic">No active sessions</div>
              ) : dashboardAgents.map((agent: any) => (
                <div key={agent.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
                  <span className="size-2 animate-pulse rounded-full bg-green" />
                  <div>
                    <strong className="block text-sm">{agent.objective}</strong>
                    <span className="text-xs text-muted">{agent.currentAction}</span>
                  </div>
                  <Badge tone={agent.status === "running" ? "running" : "info"}>{Math.round(Number(agent.confidence) * 100)}%</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <CardHeader className="mb-4">
              <CardTitle>Visual Analytics</CardTitle>
              <Badge>7 days</Badge>
            </CardHeader>
            <div className="grid h-72 grid-cols-[1fr_180px] gap-4 max-[640px]:grid-cols-1 max-[640px]:h-[34rem]">
              {mounted ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardTrend}>
                      <defs>
                        <linearGradient id="passedGradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#5ad7ff" stopOpacity={0.75} />
                          <stop offset="100%" stopColor="#5ad7ff" stopOpacity={0.08} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="day" stroke="#8d9db3" tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "#111823", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8 }} />
                      <Area type="monotone" dataKey="passed" stroke="#5ad7ff" fill="url(#passedGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dashboardSeverity} dataKey="value" innerRadius={44} outerRadius={74} paddingAngle={5}>
                        {dashboardSeverity.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#111823", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <>
                  <Skeleton className="h-full min-h-72" />
                  <Skeleton className="h-full min-h-72" />
                </>
              )}
            </div>
          </Card>

          <Card className="col-span-2 p-4 max-[980px]:col-span-1">
            <CardHeader className="mb-4">
              <CardTitle>Recent Activity</CardTitle>
              <Badge tone="info">realtime</Badge>
            </CardHeader>
            <div className="grid gap-3">
              {dashboardActivities.length === 0 ? (
                <div className="p-8 text-center text-muted text-xs italic">No recent activity</div>
              ) : dashboardActivities.map((activity: any) => (
                <div key={activity.timestamp + activity.title} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 max-[560px]:grid-cols-1">
                  <Activity className="size-4 text-cyan" />
                  <div>
                    <strong className="block text-sm">{activity.title}</strong>
                    <span className="text-sm text-muted">{activity.type === "session" ? "Automation Session" : "QA Report"}</span>
                  </div>
                  <Badge tone={activity.status}>{activity.status}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="col-span-2 p-4 max-[980px]:col-span-1">
            <CardHeader className="mb-4">
              <CardTitle>Response Time History</CardTitle>
              <Badge>ms</Badge>
            </CardHeader>
            <div className="h-64">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardTrend}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="day" stroke="#8d9db3" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "#111823", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8 }} />
                    <Bar dataKey="response" fill="#a889ff" radius={[8, 8, 2, 2]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton className="h-64" />
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
