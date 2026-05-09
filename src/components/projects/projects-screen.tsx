"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Chrome, ExternalLink, FolderPlus, Globe, Lock, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { TabButton } from "@/components/ui/tabs";
import { projects as initialProjects } from "@/services/mock-data";
import { useInspectraStore } from "@/stores/use-inspectra-store";
import type { Project } from "@/types/inspectra";

const projectTabs = ["overview", "test suites", "reports", "environments", "settings"];

export function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [showForm, setShowForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjects[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState(projectTabs[0]);
  const pushToast = useInspectraStore((state) => state.pushToast);
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0];

  function createProject(formData: FormData) {
    const name = String(formData.get("name") || "New Project");
    const baseUrl = String(formData.get("baseUrl") || "https://example.com");
    const auth = String(formData.get("auth") || "session") as Project["auth"];
    const browser = String(formData.get("browser") || "Chrome") as Project["browser"];
    const model = String(formData.get("model") || "GPT-5.4");
    const project: Project = {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      framework: "Next.js",
      baseUrl,
      lastRun: "Not run yet",
      passRate: 0,
      environments: ["staging"],
      auth,
      browser,
      model,
    };

    setProjects((current) => [project, ...current]);
    setSelectedProjectId(project.id);
    setShowForm(false);
    pushToast({
      type: "success",
      title: "Project created",
      detail: `${name} is ready for autonomous tests.`,
    });
  }

  return (
    <section aria-labelledby="projects-title">
      <div className="mb-5 flex items-end justify-between gap-4 max-[700px]:block">
        <div>
          <p className="mb-1 font-mono text-xs uppercase text-cyan">Projects</p>
          <h1 id="projects-title" className="text-5xl font-black leading-none max-[700px]:text-4xl">
            Testing workspaces
          </h1>
        </div>
        <Button variant="primary" onClick={() => setShowForm((value) => !value)} className="max-[700px]:mt-3">
          <FolderPlus className="size-4" />
          New Project
        </Button>
      </div>

      <AnimatePresence>
        {showForm ? (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            action={createProject}
            className="mb-4 grid grid-cols-5 gap-3 overflow-hidden rounded-lg border border-white/10 bg-[var(--panel)] p-4 backdrop-blur-xl max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1"
          >
            <label className="grid gap-2 text-sm text-muted">
              Project name
              <input name="name" required className="min-h-10 rounded-lg border border-white/10 bg-black/25 px-3 text-foreground" placeholder="Marketing Site" />
            </label>
            <label className="grid gap-2 text-sm text-muted">
              Base URL
              <input name="baseUrl" required type="url" className="min-h-10 rounded-lg border border-white/10 bg-black/25 px-3 text-foreground" placeholder="https://example.com" />
            </label>
            <label className="grid gap-2 text-sm text-muted">
              Authentication
              <select name="auth" className="min-h-10 rounded-lg border border-white/10 bg-[#111823] px-3 text-foreground">
                <option value="session">Session</option>
                <option value="none">None</option>
                <option value="basic">Basic</option>
                <option value="oauth">OAuth</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm text-muted">
              Browser
              <select name="browser" className="min-h-10 rounded-lg border border-white/10 bg-[#111823] px-3 text-foreground">
                <option>Chrome</option>
                <option>Firefox</option>
                <option>Edge</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm text-muted">
              AI model
              <select name="model" className="min-h-10 rounded-lg border border-white/10 bg-[#111823] px-3 text-foreground">
                <option>GPT-5.4</option>
                <option>GPT-5.4 Mini</option>
                <option>Local vision model</option>
              </select>
            </label>
            <Button variant="primary" className="self-end">Create</Button>
          </motion.form>
        ) : null}
      </AnimatePresence>

      <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-4 max-[1100px]:grid-cols-1">
        <div className="grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
          {projects.map((project) => (
            <motion.button
              key={project.id}
              whileHover={{ y: -2 }}
              type="button"
              onClick={() => setSelectedProjectId(project.id)}
              className="rounded-lg border border-white/10 bg-white/[0.045] p-4 text-left transition hover:border-cyan/35"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{project.name}</h2>
                  <span className="text-sm text-muted">{project.baseUrl}</span>
                </div>
                <Badge tone={project.passRate >= 90 ? "success" : project.passRate > 0 ? "warning" : "idle"}>
                  {project.passRate > 0 ? `${project.passRate}%` : "new"}
                </Badge>
              </div>
              <div className="grid gap-2 text-sm text-muted">
                <span className="flex items-center gap-2"><Globe className="size-4 text-cyan" /> {project.framework}</span>
                <span className="flex items-center gap-2"><Chrome className="size-4 text-cyan" /> {project.browser}</span>
                <span className="flex items-center gap-2"><Lock className="size-4 text-cyan" /> {project.auth} auth</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.environments.map((env) => <Badge key={env}>{env}</Badge>)}
              </div>
            </motion.button>
          ))}
        </div>

        <Card className="p-4">
          <CardHeader className="mb-4">
            <CardTitle>Project Details</CardTitle>
            <Button variant="icon" aria-label="Open project"><ExternalLink className="size-4" /></Button>
          </CardHeader>
          {selectedProject ? (
            <>
              <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{selectedProject.baseUrl}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {projectTabs.map((tab) => (
                  <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
                    {tab}
                  </TabButton>
                ))}
              </div>
              <div className="mt-5 rounded-lg border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Settings2 className="size-4 text-cyan" />
                  <strong className="capitalize">{activeTab}</strong>
                </div>
                <dl className="grid gap-3 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-muted">Last run</dt><dd>{selectedProject.lastRun}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted">Model</dt><dd>{selectedProject.model}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted">Browser</dt><dd>{selectedProject.browser}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted">Auth</dt><dd>{selectedProject.auth}</dd></div>
                </dl>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">No projects yet. Create your first testing workspace.</p>
          )}
        </Card>
      </div>
    </section>
  );
}
