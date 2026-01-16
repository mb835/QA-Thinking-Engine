import fs from "fs";
import path from "path";
import { resolveTemplate } from "./resolveTemplate";
import { generatePlaywrightTest } from "./generatePlaywrightTest";
import { TestCase } from "./types";

export async function generateTest(intent: string) {
  const steps = resolveTemplate(intent);

  const testCase: TestCase = {
    id: `TC-${Date.now()}`,
    title: intent,
    steps,
  };

  const code = generatePlaywrightTest(testCase);

  const outputDir = path.resolve(process.cwd(), "tests/generated");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `${testCase.id}.spec.ts`;
  const filePath = path.join(outputDir, fileName);

  fs.writeFileSync(filePath, code, "utf-8");

  return { fileName, filePath };
}