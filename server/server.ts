import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { exportTestCaseToJira } from "./jiraIntegration.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/* =========================
   AI PROMPT
========================= */
function buildScenarioPrompt(intent: string, isRetry = false) {
  return `
VRAŤ POUZE VALIDNÍ JSON.

Jsi senior QA automation architekt (enterprise úroveň).
Používáš výhradně Playwright.

${isRetry ? "POZOR: PŘEDCHOZÍ ODPOVĚĎ BYLA NEÚPLNÁ. MUSÍŠ VRÁTIT KROKY ACCEPTANCE TESTU." : ""}

Vytvoř:
- 1 hlavní ACCEPTANCE test
- 5 dalších testů: NEGATIVE, EDGE, SECURITY, UX, DATA

KAŽDÝ TEST MUSÍ OBSAHOVAT:
- id
- type
- title
- description
- expectedResult
- qaInsight:
  - reasoning
  - coverage (array)
  - risks (array)
  - automationTips (array)

POVINNÉ:
- ACCEPTANCE test MUSÍ mít:
  - preconditions (array)
  - steps (array, min. 5 kroků)

DALŠÍ TESTY:
- kroky se generují až později

STRUKTURA:

{
  "testCase": {
    "id": "TC-ACC-001",
    "type": "ACCEPTANCE",
    "title": "",
    "description": "",
    "preconditions": [],
    "steps": [],
    "expectedResult": "",
    "qaInsight": {
      "reasoning": "",
      "coverage": [],
      "risks": [],
      "automationTips": []
    },
    "additionalTestCases": []
  }
}

TESTOVACÍ ZÁMĚR:
"${intent}"
`;
}

/* =========================
   AI CALL WITH RETRY
========================= */
async function generateScenarioWithRetry(intent: string) {
  let attempt = 0;
  let lastResult: any = null;

  while (attempt < 2) {
    const isRetry = attempt === 1;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: isRetry ? 0.1 : 0.25,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Odpověz výhradně jako validní JSON objekt.",
        },
        {
          role: "user",
          content: buildScenarioPrompt(intent, isRetry),
        },
      ],
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      attempt++;
      continue;
    }

    const parsed = JSON.parse(content);
    lastResult = parsed;

    const steps = parsed?.testCase?.steps;

    if (Array.isArray(steps) && steps.length >= 5) {
      return {
        ...parsed,
        meta: {
          aiStatus: attempt === 0 ? "ok" : "retried",
        },
      };
    }

    attempt++;
  }

  // fallback – partial
  return {
    ...lastResult,
    meta: {
      aiStatus: "partial",
    },
  };
}

/* =========================
   AI – GENERATE QA ANALYSIS
========================= */
app.post("/api/scenarios", async (req, res) => {
  const { intent } = req.body;

  if (!intent || typeof intent !== "string") {
    return res.status(400).json({
      error: "Chybí nebo je neplatný testovací záměr.",
    });
  }

  try {
    const result = await generateScenarioWithRetry(intent);
    res.json(result);
  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({
      error: "Chyba při generování QA analýzy",
      details: String(error),
    });
  }
});

/* =========================
   AI – GENERATE STEPS FOR ADDITIONAL TEST CASE
========================= */
app.post("/api/scenarios/additional/steps", async (req, res) => {
  const { additionalTestCase } = req.body;

  if (!additionalTestCase?.id || !additionalTestCase?.type) {
    return res.status(400).json({ error: "Neplatný test case." });
  }

  try {
    const prompt = `
VRAŤ POUZE VALIDNÍ JSON.

Jsi senior QA automation expert.
Používáš Playwright.

Vygeneruj kroky pro test:

TYP: ${additionalTestCase.type}
NÁZEV: ${additionalTestCase.title}
POPIS: ${additionalTestCase.description}

STRUKTURA:
{
  "steps": ["string"],
  "expectedResult": "string"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Odpověz pouze jako JSON." },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("AI nevrátila žádný obsah.");

    res.json(JSON.parse(content));
  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({
      error: "Chyba při generování kroků",
      details: String(error),
    });
  }
});

/* =========================
   JIRA – EXPORT TEST CASE (MOCK)
========================= */
app.post("/api/integrations/jira/export", exportTestCaseToJira);

/* =========================
   SERVER START
========================= */
app.listen(3000, () => {
  console.log("✅ Backend běží na http://localhost:3000");
});
