const API_URL = "http://localhost:3000";

/* =========================
   GENERATE MAIN SCENARIO
========================= */
export async function generateScenario(intent: string) {
  const res = await fetch(`${API_URL}/api/scenarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ intent }),
  });

  if (!res.ok) {
    throw new Error("Failed to generate scenario");
  }

  return res.json();
}

/* =========================
   GENERATE ADDITIONAL STEPS
========================= */
export async function generateAdditionalSteps(additionalTestCase: any) {
  const res = await fetch(`${API_URL}/api/scenarios/additional/steps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ additionalTestCase }),
  });

  if (!res.ok) {
    throw new Error("Failed to generate steps");
  }

  return res.json();
}

/* =========================
   GENERATE EXPERT INSIGHT
========================= */
export async function generateExpertInsight(testCase: any) {
  const res = await fetch(`${API_URL}/api/scenarios/insight`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ testCase }),
  });

  if (!res.ok) {
    throw new Error("Failed to generate expert insight");
  }

  return res.json();
}

/* =========================
   DOWNLOAD PLAYWRIGHT SPEC
========================= */
export function downloadPlaywrightSpec(testCase: any) {
  const fileName = `${testCase.id || "test"}.spec.ts`;

  const content = `// Playwright test
// ${testCase.title}

import { test, expect } from "@playwright/test";

test("${testCase.title}", async ({ page }) => {
${(testCase.steps || [])
  .map((s: string) => `  // ${s}`)
  .join("\n")}
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
   ⭐ EXPORT TEST CASE TO JIRA
========================= */
export async function exportToJira(testCase: any): Promise<{
  issueKey: string;
  issueUrl: string;
}> {
  const res = await fetch(`${API_URL}/api/integrations/jira/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ testCase }),
  });

  if (!res.ok) {
    throw new Error("Failed to export test case to JIRA");
  }

  const data = await res.json();

  return {
    issueKey: data.issueKey,
    issueUrl: data.issueUrl,
  };
}
