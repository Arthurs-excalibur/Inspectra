"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Monitor, Smartphone, Tablet, WandSparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { TabButton } from "@/components/ui/tabs";

const modes = ["before/after slider", "side-by-side", "diff heatmap"] as const;
const viewports = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Mobile", icon: Smartphone },
] as const;

export function VisualRegressionScreen() {
  const [mode, setMode] = useState<(typeof modes)[number]>("before/after slider");
  const [viewport, setViewport] = useState<(typeof viewports)[number]["id"]>("desktop");
  const [slider, setSlider] = useState(52);

  return (
    <section aria-labelledby="visual-title">
      <div className="mb-5 flex items-end justify-between gap-4 max-[800px]:block">
        <div>
          <p className="mb-1 font-mono text-xs uppercase text-cyan">Visual Regression</p>
          <h1 id="visual-title" className="text-5xl font-black leading-none max-[700px]:text-4xl">
            Screenshot comparison
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 max-[800px]:mt-3">
          {modes.map((item) => (
            <TabButton key={item} active={mode === item} onClick={() => setMode(item)}>
              {item}
            </TabButton>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-4 max-[980px]:grid-cols-1">
        <Card className="relative min-h-[560px] overflow-hidden p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {viewports.map((item) => {
                const Icon = item.icon;
                return (
                  <TabButton key={item.id} active={viewport === item.id} onClick={() => setViewport(item.id)}>
                    <Icon className="size-4" />
                    {item.label}
                  </TabButton>
                );
              })}
            </div>
            <Badge tone="running">{mode}</Badge>
          </div>

          <div className="relative min-h-[460px] overflow-hidden rounded-lg border border-white/10 bg-[#edf2f7]">
            <div className="absolute inset-0 grid grid-cols-2 text-[#182230]">
              <ScreenshotMock label="Before" />
              <ScreenshotMock label="After" shifted />
            </div>
            {mode === "before/after slider" ? (
              <motion.div
                className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-cyan bg-[#edf2f7]"
                style={{ width: `${slider}%` }}
              >
                <div className="h-full w-[calc(100vw-360px)] max-w-[900px]">
                  <ScreenshotMock label="Before" />
                </div>
              </motion.div>
            ) : null}
            {mode === "diff heatmap" ? (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_55%,rgba(255,111,131,0.42),transparent_17rem),radial-gradient(circle_at_55%_35%,rgba(245,191,95,0.28),transparent_12rem)] mix-blend-multiply" />
            ) : null}
            {mode === "before/after slider" ? (
              <input
                value={slider}
                onChange={(event) => setSlider(Number(event.target.value))}
                type="range"
                min="15"
                max="85"
                className="absolute bottom-5 left-[8%] w-[84%] accent-cyan"
                aria-label="Before after slider"
              />
            ) : null}
          </div>
        </Card>

        <Card className="p-4">
          <CardHeader className="mb-4">
            <CardTitle>Smart Detection</CardTitle>
            <Badge tone="error">3 issues</Badge>
          </CardHeader>
          <div className="grid gap-3">
            {[
              ["Missing mobile checkout summary", "critical"],
              ["Primary CTA shifted 18 px down", "warning"],
              ["Payment error text contrast below target", "warning"],
              ["Spacing drift in plan cards", "info"],
            ].map(([issue, tone]) => (
              <button key={issue} type="button" className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-left text-sm transition hover:border-cyan/30">
                <span className="mb-2 flex items-center gap-2 text-muted">
                  <WandSparkles className="size-4 text-cyan" />
                  AI highlight
                </span>
                <strong>{issue}</strong>
                <Badge className="mt-3" tone={tone === "critical" ? "error" : tone === "warning" ? "warning" : "info"}>
                  {tone}
                </Badge>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

function ScreenshotMock({ label, shifted }: { label: string; shifted?: boolean }) {
  return (
    <div className="grid content-start gap-5 border-r border-slate-300 p-5">
      <span className="text-sm font-semibold">{label}</span>
      <div className="h-12 rounded-lg bg-slate-300" />
      <div className={`h-44 rounded-lg bg-gradient-to-br ${shifted ? "translate-y-4 from-[#ffc4cf] to-[#d2f6fb]" : "from-[#d9e8ff] to-[#c8f7e2]"}`} />
      <div className={`h-14 rounded-lg ${shifted ? "bg-[#ffd2da] shadow-[0_0_0_3px_rgba(255,111,131,0.45)]" : "bg-slate-300"}`} />
      <div className="h-14 w-2/3 rounded-lg bg-slate-300" />
    </div>
  );
}
