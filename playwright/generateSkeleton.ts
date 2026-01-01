import { TestCase } from "../agent/scenarios/types";

export function generatePlaywrightSkeleton(testCase: TestCase): string {
  if (!testCase.steps || testCase.steps.length === 0) {
    throw new Error(
      `Cannot generate Playwright skeleton: TestCase "${testCase.title}" has no steps.`
    );
  }

  if (!testCase.qaInsight) {
    throw new Error(
      `Cannot generate Playwright skeleton: TestCase "${testCase.title}" has no QA Insight.`
    );
  }

  const stepsComment = testCase.steps
    .map((step, i) => `// ${i + 1}. ${step}`)
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
${testCase.qaInsight.coverage.map((c) => ` * - ${c}`).join("\n")}
 *
 * Risks:
${testCase.qaInsight.risks.map((r) => ` * - ${r}`).join("\n")}
 *
 * Automation tips:
${testCase.qaInsight.automationTips.map((t) => ` * - ${t}`).join("\n")}
 */
`;

  return `
import { test, expect } from "@playwright/test";

test("${testCase.title}", async ({ page }) => {
${stepsComment}

  // TODO: Implement Playwright steps here
});
${qaInsightBlock}
`;
}
