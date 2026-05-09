"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Bot, Mic, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

  function execute() {
    pushToast({
      type: "success",
      title: "AI test started",
      detail: command,
    });
    router.push("/live");
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 font-mono text-xs uppercase text-cyan">AI Command</p>
          <h2 className="text-lg font-semibold">What should Inspectra verify?</h2>
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
        <Button variant="primary" onClick={execute}>
          <Play className="size-4" />
          Execute
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
