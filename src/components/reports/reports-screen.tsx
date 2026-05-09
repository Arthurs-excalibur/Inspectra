"use client";

import { FileJson, FileText, Github, ListChecks, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { reports } from "@/services/mock-data";
import { useInspectraStore } from "@/stores/use-inspectra-store";

export function ReportsScreen() {
  const selectedReportId = useInspectraStore((state) => state.selectedReportId);
  const setSelectedReportId = useInspectraStore((state) => state.setSelectedReportId);
  const report = reports.find((item) => item.id === selectedReportId) ?? reports[0];

  return (
    <section aria-labelledby="reports-title">
      <div className="mb-5 flex items-end justify-between gap-4 max-[760px]:block">
        <div>
          <p className="mb-1 font-mono text-xs uppercase text-cyan">Reports</p>
          <h1 id="reports-title" className="text-5xl font-black leading-none max-[700px]:text-4xl">
            Generated findings
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 max-[760px]:mt-3">
          <Button variant="secondary"><FileText className="size-4" /> Markdown</Button>
          <Button variant="secondary"><Printer className="size-4" /> PDF</Button>
          <Button variant="secondary"><FileJson className="size-4" /> JSON</Button>
          <Button variant="secondary"><Github className="size-4" /> GitHub</Button>
        </div>
      </div>

      <div className="grid grid-cols-[340px_minmax(0,1fr)] gap-4 max-[980px]:grid-cols-1">
        <Card className="p-3">
          <div className="grid gap-2">
            {reports.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedReportId(item.id)}
                className={`rounded-lg border p-3 text-left transition ${
                  item.id === report.id
                    ? "border-cyan/40 bg-cyan/10"
                    : "border-white/10 bg-white/[0.04] hover:border-cyan/25"
                }`}
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <strong className="text-sm">{item.title}</strong>
                  <Badge tone={item.severity === "critical" ? "error" : item.severity === "warning" ? "warning" : "info"}>
                    {item.severity}
                  </Badge>
                </div>
                <div className="flex justify-between gap-3 text-xs text-muted">
                  <span>{item.environment}</span>
                  <span>{item.issueCount} issues</span>
                </div>
                <span className="mt-2 block text-xs text-muted">{item.generatedAt}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader className="mb-5">
            <CardTitle className="text-2xl">{report.title}</CardTitle>
            <Badge tone={report.severity === "critical" ? "error" : report.severity === "warning" ? "warning" : "info"}>{report.severity}</Badge>
          </CardHeader>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Executive Summary</h2>
            <p className="leading-7 text-muted">{report.summary}</p>
          </section>

          <section className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">Detected Issues</h2>
            <div className="grid gap-3">
              {report.issues.map((issue) => (
                <article key={issue.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-semibold">{issue.title}</h3>
                    <Badge tone={issue.severity === "critical" ? "error" : issue.severity === "warning" ? "warning" : "info"}>{issue.confidence}% confidence</Badge>
                  </div>
                  <div className="grid grid-cols-[180px_1fr] gap-4 max-[760px]:grid-cols-1">
                    <div className="min-h-32 rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(90,215,255,0.32),rgba(255,111,131,0.24))]" />
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold"><ListChecks className="size-4 text-cyan" /> Reproduction Steps</h4>
                      <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-muted">
                        {issue.reproductionSteps.map((step) => <li key={step}>{step}</li>)}
                      </ol>
                      <p className="text-sm text-muted"><strong className="text-foreground">Suggested fix:</strong> {issue.suggestedFix}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
            <div>
              <h2 className="mb-3 text-lg font-semibold">Timeline Replay</h2>
              <div className="rounded-lg border border-white/10 bg-black/25 p-4">
                <input type="range" min="0" max="100" defaultValue="78" className="w-full accent-cyan" />
                <p className="mt-3 text-sm text-muted">Replay paused at mobile viewport capture.</p>
              </div>
            </div>
            <div>
              <h2 className="mb-3 text-lg font-semibold">Technical Logs</h2>
              <pre className="max-h-48 overflow-auto rounded-lg border border-white/10 bg-black/25 p-4 font-mono text-xs text-green">
                {report.technicalLogs.join("\n")}
              </pre>
            </div>
          </section>
        </Card>
      </div>
    </section>
  );
}
