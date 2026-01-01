import { Router } from "express";
import { generatePlaywrightSkeleton } from "../agent/playwright/generateSkeleton";
import { writePlaywrightTest } from "../agent/playwright/playwrightGenerator";
import { TestCase } from "../agent/scenarios/types";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const testCase: TestCase = req.body;

    const code = generatePlaywrightSkeleton(testCase);
    const fileName = await writePlaywrightTest(testCase, code);

    res.json({
      success: true,
      fileName,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;
