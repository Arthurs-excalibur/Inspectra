"use client";

import { Bell, Bot, Chrome, PlugZap } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "AI Settings",
    icon: Bot,
    fields: [
      ["Model provider", "select", ["OpenAI", "Local", "Hybrid"]],
      ["Local/cloud selection", "select", ["Cloud", "Local-first", "Hybrid"]],
      ["Reasoning mode", "select", ["Balanced", "High", "Transparent trace"]],
      ["Temperature", "range", []],
    ],
  },
  {
    title: "Browser Settings",
    icon: Chrome,
    fields: [
      ["Chrome", "checkbox", []],
      ["Firefox", "checkbox", []],
      ["Edge", "checkbox", []],
      ["Headless mode", "checkbox", []],
      ["Viewport presets", "select", ["Desktop 1440", "Tablet 768", "Mobile 390"]],
    ],
  },
  {
    title: "MCP Configuration",
    icon: PlugZap,
    fields: [
      ["Browser MCP", "checkbox", []],
      ["Filesystem MCP", "checkbox", []],
      ["Screenshot MCP", "checkbox", []],
      ["GitHub MCP", "checkbox", []],
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    fields: [
      ["Desktop notifications", "checkbox", []],
      ["Webhook alerts", "checkbox", []],
      ["Discord integration", "checkbox", []],
      ["Slack integration", "checkbox", []],
    ],
  },
];

export function SettingsScreen() {
  return (
    <section aria-labelledby="settings-title">
      <div className="mb-5">
        <p className="mb-1 font-mono text-xs uppercase text-cyan">Settings</p>
        <h1 id="settings-title" className="text-5xl font-black leading-none max-[700px]:text-4xl">
          Agent configuration
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="p-4">
              <CardHeader className="mb-4">
                <CardTitle className="flex items-center gap-2">
                  <Icon className="size-4 text-cyan" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <div className="grid gap-4">
                {section.fields.map(([label, type, options]) => (
                  <label key={String(label)} className="grid gap-2 text-sm text-muted">
                    {type === "checkbox" ? (
                      <span className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked={String(label).includes("Chrome") || String(label).includes("Desktop") || String(label).includes("Browser") || String(label).includes("Filesystem")} className="size-4 accent-cyan" />
                        {label}
                      </span>
                    ) : (
                      <>
                        {label}
                        {type === "select" ? (
                          <select className="min-h-10 rounded-lg border border-white/10 bg-[#111823] px-3 text-foreground">
                            {(options as string[]).map((option) => <option key={option}>{option}</option>)}
                          </select>
                        ) : (
                          <input type="range" min="0" max="100" defaultValue="28" className="accent-cyan" />
                        )}
                      </>
                    )}
                  </label>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
