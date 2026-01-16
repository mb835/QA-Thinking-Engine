import { TestCase } from "./types";
import { stepsToPlaywrightCode } from "./playwrightGenerator";

export function generatePlaywrightTest(testCase: TestCase): string {
  const stepsCode = stepsToPlaywrightCode(testCase.steps);

  return `import { test, expect } from "@playwright/test";

test(${JSON.stringify(testCase.title)}, async ({ page, context }) => {

  // Cookie & consent bypass (best effort)
  await context.addCookies([
    { name: "cookieConsent", value: "accepted", domain: ".alza.cz", path: "/" },
    { name: "consent", value: "true", domain: ".alza.cz", path: "/" },
  ]);

  await page.addInitScript(() => {
    localStorage.setItem("cookieConsent", "accepted");
    localStorage.setItem("consent", "true");
    localStorage.setItem("cookiesAccepted", "true");
  });

  await page.route("**/*consent*", r => r.abort());
  await page.route("**/*cookie*", r => r.abort());
  await page.route("**/*gdpr*", r => r.abort());

${stepsCode}

});
`;
}