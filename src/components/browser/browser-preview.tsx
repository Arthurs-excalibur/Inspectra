"use client";

import { Maximize2, MousePointer2, Pause, Play, RotateCw, ZoomIn } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/use-inspectra-data";
import { useInspectraStore } from "@/stores/use-inspectra-store";
import { cn } from "@/lib/utils";

export function BrowserPreview() {
  const viewport = useInspectraStore((state) => state.selectedViewport);
  const setViewport = useInspectraStore((state) => state.setSelectedViewport);
  const paused = useInspectraStore((state) => state.sessionPaused);
  const setPaused = useInspectraStore((state) => state.setSessionPaused);
  const liveFrame = useInspectraStore((state) => state.liveFrame);
  const selectedProjectId = useInspectraStore((state) => state.selectedProjectId);
  const { data: projects } = useProjects();
  const currentProject = projects?.find((p: any) => p.id === selectedProjectId) || projects?.[0];

  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-[var(--panel)] backdrop-blur-xl" aria-label="Browser preview">
      <div className="flex items-center gap-2 border-b border-white/10 p-3">
        <span className="size-3 rounded-full bg-red" />
        <span className="size-3 rounded-full bg-amber" />
        <span className="size-3 rounded-full bg-green" />
        <div className="min-w-0 flex-1 rounded-lg bg-black/25 px-3 py-2 font-mono text-xs text-muted truncate">
          {currentProject?.baseUrl ?? "https://awaiting-objective.test"}
        </div>
        <select
          value={viewport}
          onChange={(event) => setViewport(event.target.value as typeof viewport)}
          className="min-h-9 rounded-lg border border-white/10 bg-[#111823] px-2 text-sm"
          aria-label="Viewport"
        >
          <option value="desktop">Desktop</option>
          <option value="tablet">Tablet</option>
          <option value="mobile">Mobile</option>
        </select>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 p-3">
        <div className="flex gap-2">
          <Button variant="icon" aria-label={paused ? "Resume execution" : "Pause execution"} onClick={() => setPaused(!paused)}>
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </Button>
          <Button variant="icon" aria-label="Restart execution"><RotateCw className="size-4" /></Button>
          <Button variant="icon" aria-label="Zoom browser"><ZoomIn className="size-4" /></Button>
          <Button variant="icon" aria-label="Fullscreen preview"><Maximize2 className="size-4" /></Button>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs text-cyan">
          <MousePointer2 className="size-3.5" />
          interaction map active
        </div>
      </div>

      <div className={cn("grid min-h-[520px] place-items-center p-6 transition-all", viewport === "tablet" && "px-[14%]", viewport === "mobile" && "px-[28%] max-[760px]:px-5")}>
        <motion.div layout className="relative h-full min-h-[440px] w-full overflow-hidden rounded-lg border border-slate-300 bg-[#eef4f7] text-[#17202b] shadow-2xl">
          {liveFrame ? (
            <img 
              src={liveFrame} 
              alt="Live Browser Preview" 
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-muted">
               <RotateCw className="size-8 animate-spin" />
               <p>Awaiting browser frame...</p>
            </div>
          )}
          
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="absolute bottom-6 right-6 grid size-10 place-items-center rounded-full bg-cyan font-black text-[#061017] shadow-[0_0_0_8px_rgba(90,215,255,0.22)]"
          >
            AI
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
