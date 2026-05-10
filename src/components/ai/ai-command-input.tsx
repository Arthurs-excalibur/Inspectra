"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Bot, Mic, Play, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCreateSession } from "@/hooks/use-inspectra-data";
import { useInspectraStore } from "@/stores/use-inspectra-store";

const presets = [
  {
    label: "/accessibility",
    prompt: "Audit login flow accessibility and screenshots",
  },
  {
    label: "/visual-diff",
    prompt: "Compare checkout screenshots across desktop and mobile",
  },
  {
    label: "/report",
    prompt: "Generate markdown report for failed payment states",
  },
];

export function AiCommandInput() {
  const command = useInspectraStore((state) => state.command);
  const setCommand = useInspectraStore((state) => state.setCommand);
  const pushToast = useInspectraStore((state) => state.pushToast);
  const router = useRouter();
  const selectedProjectId = useInspectraStore((state) => state.selectedProjectId);
  const { mutate: createSession, isPending } = useCreateSession();

  function execute() {
    if (!selectedProjectId) {
      pushToast({
        type: "warning",
        title: "No project selected",
        detail: "Please select a project before running an AI test.",
      });
      return;
    }

    createSession({ projectId: selectedProjectId, prompt: command }, {
      onSuccess: (session) => {
        useInspectraStore.getState().setSelectedSessionId(session.id);
        pushToast({
          type: "success",
          title: "AI test started",
          detail: command,
        });
        router.push("/live");
      },
      onError: (error: any) => {
        pushToast({
          type: "critical",
          title: "Failed to start test",
          detail: error.message || "An unexpected error occurred.",
        });
      }
    });
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs uppercase text-cyan">AI Command</p>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">What should Inspectra verify?</h2>
            {selectedProjectId && (
              <Badge tone="running" className="animate-in fade-in slide-in-from-left-2">
                Context: {selectedProjectId}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1.5 text-xs text-cyan">
          <Sparkles className="size-3.5" />
          slash commands ready
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">AI testing command</span>
          <Bot className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-cyan" />
          <input
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            className="min-h-14 w-full rounded-lg border border-white/10 bg-black/25 pl-12 pr-4 text-sm text-foreground placeholder:text-muted"
            placeholder="Test checkout flow and report mobile UI issues"
          />
        </label>
        <Button variant="secondary" className="md:w-12" aria-label="Voice input">
          <Mic className="size-4" />
        </Button>
        <Button variant="primary" onClick={execute} disabled={isPending}>
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Starting...
            </span>
          ) : (
            <>
              <Play className="size-4" />
              Execute
            </>
          )}
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {presets.map((preset) => (
          <motion.button
            key={preset.label}
            whileHover={{ y: -1 }}
            type="button"
            onClick={() => setCommand(preset.prompt)}
            className="min-h-8 rounded-lg border border-white/10 bg-white/[0.04] px-3 font-mono text-xs text-muted transition hover:border-cyan/30 hover:text-cyan"
          >
            {preset.label}
          </motion.button>
        ))}
      </div>
    </Card>
  );
}
