import { Step } from "./types";

export function stepToPlaywright(step: Step): string {
  switch (step.action) {
    case "goto":
      return `  await page.goto("${step.url}");`;

    case "fill":
      return `  await page.fill("${step.selector}", "${step.value}");`;

    case "click":
      return `  await page.click("${step.selector}");`;

    case "expect-url":
      return `  await expect(page).toHaveURL(/${step.urlPart}/);`;

    default:
      return `  // Unsupported step`;
  }
}

export function stepsToPlaywrightCode(steps: Step[]): string {
  return steps.map(stepToPlaywright).join("\n");
}