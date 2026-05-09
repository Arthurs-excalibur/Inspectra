import type { Project, Report, TimelineEvent, ActivityItem } from "@/types/inspectra";

export const projects: Project[] = [
  {
    id: "acme-checkout",
    name: "Acme Checkout",
    framework: "Next.js",
    baseUrl: "https://checkout.acme.com",
    lastRun: "2 hours ago",
    passRate: 94,
    environments: ["production", "staging"],
    auth: "session",
    browser: "Chrome",
    model: "GPT-5.4",
  },
  {
    id: "quantum-dashboard",
    name: "Quantum Dashboard",
    framework: "React",
    baseUrl: "https://dashboard.quantum.io",
    lastRun: "Yesterday",
    passRate: 88,
    environments: ["staging"],
    auth: "oauth",
    browser: "Firefox",
    model: "GPT-5.4 Mini",
  },
  {
    id: "stellar-api",
    name: "Stellar API",
    framework: "Node.js",
    baseUrl: "https://api.stellar.dev",
    lastRun: "3 days ago",
    passRate: 100,
    environments: ["production"],
    auth: "none",
    browser: "Edge",
    model: "Local vision model",
  },
];

export const reports: Report[] = [
  {
    id: "rep-1",
    title: "Checkout Flow - Mobile Regression",
    severity: "critical",
    environment: "production",
    generatedAt: "2026-05-09T10:30:00Z",
    issueCount: 3,
    summary: "Significant layout shifts detected on mobile viewport during checkout process.",
    issues: [
      {
        id: "iss-1",
        title: "CTA Button Overlap",
        severity: "critical",
        confidence: 0.98,
        reproductionSteps: ["Navigate to /checkout", "Switch to mobile viewport", "Scroll to bottom"],
        suggestedFix: "Add padding-bottom to the container or use sticky positioning for the CTA.",
      }
    ],
    technicalLogs: ["[INFO] Navigating to /checkout", "[WARN] Element overflow detected at line 442"],
  },
  {
    id: "rep-2",
    title: "Login Authentication Audit",
    severity: "info",
    environment: "staging",
    generatedAt: "2026-05-08T15:45:00Z",
    issueCount: 0,
    summary: "Authentication flow is stable and meeting all security criteria.",
    issues: [],
    technicalLogs: ["[INFO] Authentication successful"],
  }
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: "evt-1",
    time: "10:00:01",
    type: "page-load",
    label: "Page Load: /checkout",
    status: "success",
  },
  {
    id: "evt-2",
    time: "10:00:05",
    type: "fill",
    label: "Fill: Email field",
    status: "success",
  },
  {
    id: "evt-3",
    time: "10:00:08",
    type: "click",
    label: "Click: Continue button",
    status: "success",
  },
  {
    id: "evt-4",
    time: "10:00:12",
    type: "error",
    label: "Error: Payment method failed to load",
    status: "error",
  },
  {
    id: "evt-5",
    time: "10:00:15",
    type: "screenshot",
    label: "Screenshot captured",
    status: "idle",
  },
];

export const screenshots: Screenshot[] = [
  {
    id: "shot-1",
    label: "Desktop Checkout",
    viewport: "desktop",
  },
  {
    id: "shot-2",
    label: "Mobile Login",
    viewport: "mobile",
    issue: "CTA overlaps footer",
  },
  {
    id: "shot-3",
    label: "Tablet Nav",
    viewport: "tablet",
  },
];

export const activityItems: ActivityItem[] = [

  {
    id: "act-1",
    type: "run",
    title: "Checkout Test",
    detail: "Acme Checkout production environment",
    time: "10 mins ago",
  },
  {
    id: "act-2",
    type: "failure",
    title: "Layout Shift",
    detail: "Critical UI regression on mobile",
    time: "1 hour ago",
  },
];
