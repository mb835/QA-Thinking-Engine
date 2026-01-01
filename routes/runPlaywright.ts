// agent/routes/runPlaywright.ts

import { Request, Response } from "express";
import { generatePlaywrightTest } from "../playwright/playwrightGenerator";
import { TestCase } from "../scenarios/types";

export async function runPlaywright(req: Request, res: Response) {
  try {
    const testCase = req.body.testCase as TestCase;

    if (!testCase) {
      return res.status(400).json({ error: "Missing testCase" });
    }

    const result = generatePlaywrightTest(testCase);

    res.json({
      success: true,
      file: result.fileName,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Playwright generation failed" });
  }
}
