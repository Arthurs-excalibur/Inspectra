"use client";


import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Square } from "lucide-react";
import { BrowserPreview } from "@/components/browser/browser-preview";
import { SessionTimeline } from "@/components/timeline/session-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useLiveSession } from "@/hooks/use-inspectra-data";
import { useInspectraStore } from "@/stores/use-inspectra-store";

export function LiveSessionScreen() {
  const paused = useInspectraStore((state) => state.sessionPaused);
  const setPaused = useInspectraStore((state) => state.setSessionPaused);
  const selectedSessionId = "latest"; // This should be dynamic in a real app
  const { data: session, isLoading } = useLiveSession(selectedSessionId);
  const pushToast = useInspectraStore((state) => state.pushToast);
  
  const aiLogs = session?.aiLogs ?? [];

  return (
    <section aria-labelledby="live-title">
      <div className="mb-5 flex items-end justify-between gap-4 max-[700px]:block">
        <div>
          <p className="mb-1 font-mono text-xs uppercase text-cyan">Live Session</p>
          <h1 id="live-title" className="text-5xl font-black leading-none max-[700px]:text-4xl">
            {session?.objective ?? "No Active Session"}
          </h1>
        </div>
        <div className="flex gap-2 max-[700px]:mt-3">
          <Button variant="icon" aria-label={paused ? "Resume session" : "Pause session"} onClick={() => setPaused(!paused)}>
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setPaused(true);
              pushToast({
                type: "warning",
                title: "Session stopped",
                detail: "Timeline, screenshots, and logs remain available.",
              });
            }}
          >
            <Square className="size-4" />
            Stop
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] gap-4 max-[1080px]:grid-cols-1">
        <BrowserPreview />

        <Card className="min-h-[520px] p-4">
          <CardHeader className="mb-4">
            <CardTitle>AI Reasoning</CardTitle>
            <Badge tone={paused ? "warning" : "running"}>{paused ? "paused" : "running"}</Badge>
          </CardHeader>
          <ol className="grid gap-3 pl-0">
            <AnimatePresence initial={false}>
              {aiLogs.map((log: any, index: number) => (
                <motion.li
                  key={log.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-[auto_1fr] gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm"
                >
                  <span className="font-mono text-cyan">[{log.type.toUpperCase()}]</span>
                  <span className={index === aiLogs.length - 1 ? "text-foreground" : "text-muted"}>{log.message}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
          {aiLogs.length === 0 ? (
            <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-muted text-center">
              Waiting for AI agent to initialize...
            </p>
          ) : null}
        </Card>

        <div className="col-span-2 max-[1080px]:col-span-1">
          <SessionTimeline />
        </div>
      </div>
    </section>
  );
}
