"use client";

import { useState } from "react";
import { Camera, CheckCircle2, Code2, FileText, MousePointerClick, Navigation, Timer, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { TabButton } from "@/components/ui/tabs";
import { screenshots, timelineEvents } from "@/services/mock-data";

const tabs = ["Timeline", "Console Logs", "Actions", "Screenshots", "DOM Inspector"] as const;

const iconMap = {
  "page-load": Timer,
  click: MousePointerClick,
  fill: FileText,
  navigation: Navigation,
  error: XCircle,
  screenshot: Camera,
};

export function SessionTimeline() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Timeline");

  return (
    <Card className="p-4">
      <CardHeader className="mb-4">
        <CardTitle>Execution Details</CardTitle>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
              {tab}
            </TabButton>
          ))}
        </div>
      </CardHeader>

      {activeTab === "Timeline" && (
        <div>
          <label className="mb-4 grid gap-2 text-sm text-muted">
            Timeline scrubber
            <input type="range" min="0" max={timelineEvents.length - 1} defaultValue={timelineEvents.length - 1} className="accent-cyan" />
          </label>
          <div className="grid gap-3">
            {timelineEvents.map((event) => {
              const Icon = iconMap[event.type];
              return (
                <div key={event.id} className="grid grid-cols-[84px_auto_1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 max-[640px]:grid-cols-1">
                  <span className="font-mono text-xs text-muted">{event.time}</span>
                  <Icon className="size-4 text-cyan" />
                  <strong className="text-sm">{event.label}</strong>
                  <Badge tone={event.status}>{event.status}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "Console Logs" && (
        <div className="grid gap-2 font-mono text-xs">
          {timelineEvents.map((event) => (
            <div key={event.id} className="rounded-lg border border-white/10 bg-black/25 p-3 text-muted">
              [{event.time}] automation.{event.type.replace("-", ".")} status={event.status}
            </div>
          ))}
        </div>
      )}

      {activeTab === "Actions" && (
        <div className="grid gap-2 font-mono text-xs">
          {[
            "page.goto('/checkout')",
            "getByRole('button', { name: 'Login' }).click()",
            "fill('[name=email]', qaProfile.email)",
            "setViewportSize({ width: 390, height: 844 })",
            "captureScreenshot('checkout-mobile-overlap')",
          ].map((action, index) => (
            <div key={action} className="grid grid-cols-[32px_1fr_auto] gap-3 rounded-lg border border-white/10 bg-black/25 p-3 text-muted">
              <span>{index + 1}</span>
              <code>{action}</code>
              <CheckCircle2 className="size-4 text-green" />
            </div>
          ))}
        </div>
      )}

      {activeTab === "Screenshots" && (
        <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
          {screenshots.map((shot) => (
            <button key={shot.id} type="button" className="min-h-40 rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(90,215,255,0.32),rgba(255,122,200,0.12),rgba(88,230,167,0.14))] p-3 text-left transition hover:border-cyan/40">
              <Badge tone={shot.issue ? "error" : "running"}>{shot.viewport}</Badge>
              <strong className="mt-20 block">{shot.label}</strong>
              {shot.issue ? <span className="text-xs text-red">{shot.issue}</span> : null}
            </button>
          ))}
        </div>
      )}

      {activeTab === "DOM Inspector" && (
        <div className="grid grid-cols-3 gap-3 max-[840px]:grid-cols-1">
          {[
            ["Selected element", "button#pay-now.primary"],
            ["Accessibility", "role=button, name='Pay now', contrast warning"],
            ["CSS metadata", "position: sticky; bottom: 0; z-index: 20"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-black/25 p-4">
              <span className="mb-2 flex items-center gap-2 text-sm text-muted"><Code2 className="size-4 text-cyan" /> {label}</span>
              <strong className="text-sm">{value}</strong>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
