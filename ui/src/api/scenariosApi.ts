const API_URL = "http://localhost:3000";

/* =========================
   GENERATE MAIN SCENARIO
========================= */
export async function generateScenario(intent: string) {
  const res = await fetch(`${API_URL}/api/scenarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intent }),
  });

  if (!res.ok) throw new Error("Failed to generate scenario");
  return res.json();
}

/* =========================
   GENERATE ADDITIONAL STEPS
========================= */
export async function generateAdditionalSteps(additionalTestCase: any) {
  const res = await fetch(`${API_URL}/api/scenarios/additional/steps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ additionalTestCase }),
  });

  if (!res.ok) throw new Error("Failed to generate steps");
  return res.json();
}

/* =========================
   GENERATE EXPERT INSIGHT
========================= */
export async function generateExpertInsight(testCase: any) {
  const res = await fetch(`${API_URL}/api/scenarios/insight`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ testCase }),
  });

  if (!res.ok) throw new Error("Failed to generate expert insight");
  return res.json();
}

/* =========================
   DOWNLOAD PLAYWRIGHT SPEC
========================= */
export function downloadPlaywrightSpec(testCase: any) {
  const fileName = `${testCase.id || "test"}.spec.ts`;

  const content = `import { test, expect } from "@playwright/test";

test("${testCase.title}", async ({ page }) => {
${(testCase.steps || []).map((s: string) => `  // ${s}`).join("\n")}
});
`;

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url);
}

/* =========================
   ⭐ EXPORT SINGLE TEST CASE TO JIRA
========================= */
export async function exportToJira(testCase: any): Promise<{
  issueKey: string;
  issueUrl: string;
}> {
  const res = await fetch(
    `${API_URL}/api/integrations/jira/export-testcase`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testCase }),
    }
  );

  if (!res.ok) {
    const t = await res.text();
    console.error("JIRA export error:", t);
    throw new Error("Failed to export test case to JIRA");
  }

  return res.json();
}

/* =========================
   ⭐ EXPORT WHOLE SCENARIO TO JIRA
   (returns jobId – async job)
========================= */
export async function exportScenarioToJira(testCase: any): Promise<{
  jobId: string;
}> {
  const res = await fetch(
    `${API_URL}/api/integrations/jira/export-scenario`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testCase }),
    }
  );

  if (!res.ok) {
    const t = await res.text();
    console.error("JIRA scenario export error:", t);
    throw new Error("Failed to export scenario to JIRA");
  }

  return res.json(); // { jobId }
}

/* =========================
   ⭐ GET EXPORT JOB STATUS
   (for loading bar / progress)
========================= */
export async function getScenarioExportStatus(jobId: string): Promise<{
  id: string;
  total: number;
  done: number;
  status: "running" | "done" | "error";
  result?: {
    epic: { key: string; url: string };
    tasks: { id: string; key: string; url: string }[];
  };
  error?: any;
}> {
  const res = await fetch(
    `${API_URL}/api/integrations/jira/export-status/${jobId}`
  );

  if (!res.ok) {
    const t = await res.text();
    console.error("Export status error:", t);
    throw new Error("Failed to get export status");
  }

  return res.json();
}
