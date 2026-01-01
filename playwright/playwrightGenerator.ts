// agent/playwright/playwrightGenerator.ts

import fs from "fs";
import path from "path";
import { TestCase } from "../scenarios/types";
import { generatePlaywrightSkeleton } from "./generateSkeleton";

export function generatePlaywrightTest(testCase: TestCase) {
  const code = generatePlaywrightSkeleton(testCase);

  const fileName =
    testCase.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") + ".spec.ts";

  const targetPath = path.join(
    process.cwd(),
    "playwright",
    "specs",
    fileName
  );

  fs.writeFileSync(targetPath, code, { encoding: "utf-8" });

  return {
    fileName,
    path: targetPath,
  };
}
