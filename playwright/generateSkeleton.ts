// agent/playwright/generateSkeleton.ts

import { TestCase } from "../scenarios/types";

export function generatePlaywrightSkeleton(testCase: TestCase): string {
  const stepsComment = testCase.steps
    .map((step: string, i: number) => `// ${i + 1}. ${step}`)
    .join("\n");

  const qaInsightBlock = `
/**
 * ============================
 * QA INSIGHT
 * ============================
 *
 * Reasoning:
 * ${testCase.qaInsight.reasoning}
 *
 * Coverage:
 * ${testCase.qaInsight.coverage.map((c: string) => `- ${c}`).join("\n * ")}
 *
 * Risks:
 * ${testCase.qaInsight.risks.map((r: string) => `- ${r}`).join("\n * ")}
 *
 * Automation tips:
 * ${(testCase.qaInsight.automationTips ?? [])
   .map((t: string) => `- ${t}`)
   .join("\n * ")}
 */
`;

  return `
import { test, expect } from "@playwright/test";

${qaInsightBlock}

test("${testCase.title}", async ({ page }) => {
${stepsComment}

  // TODO: Implement Playwright steps
  await page.goto("https://www.alza.cz");

  // expect(...)
});
`;
}
