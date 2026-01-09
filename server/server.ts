import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fetch from "node-fetch";
import { spawn } from "child_process";
console.log("🔥 SERVER VERSION: JIRA ADF EXPORT ENABLED");

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
   AI PROMPT – SCENARIO
========================= */
function buildScenarioPrompt(intent: string, isRetry = false) {
  return `
VRAŤ POUZE VALIDNÍ JSON.

Jsi senior QA automation architekt (enterprise úroveň).
Používáš výhradně Playwright.

${isRetry ? "POZOR: PŘEDCHOZÍ ODPOVĚĎ BYLA NEÚPLNÁ. ACCEPTANCE TEST MUSÍ MÍT KROKY." : ""}

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
- NESMÍ obsahovat kroky

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
        { role: "system", content: "Odpověz výhradně jako validní JSON objekt." },
        { role: "user", content: buildScenarioPrompt(intent, isRetry) },
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

  return {
    ...lastResult,
    meta: {
      aiStatus: "partial",
    },
  };
}

/* =========================
   AI – GENERATE SCENARIO
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
   AI – GENERATE STEPS
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
   AI – GENERATE EXPERT INSIGHT
========================= */
app.post("/api/scenarios/insight", async (req, res) => {
  const { testCase } = req.body;

  if (!testCase?.title || !testCase?.type) {
    return res.status(400).json({ error: "Neplatný test case." });
  }

  try {
    const prompt = `
VRAŤ POUZE VALIDNÍ JSON.

Jsi senior QA expert.

Dopočítej Expert QA Insight pro test:

TYP: ${testCase.type}
NÁZEV: ${testCase.title}
POPIS: ${testCase.description}

STRUKTURA:
{
  "reasoning": "",
  "coverage": [],
  "risks": [],
  "automationTips": []
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Odpověz pouze jako JSON." },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("AI nevrátila žádný obsah.");

    res.json({ qaInsight: JSON.parse(content) });
  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({
      error: "Chyba při generování Expert Insight",
      details: String(error),
    });
  }
});

/* =========================
   ⭐ JIRA – ADF DESCRIPTION BUILDER
========================= */
function text(text: string) {
  return { type: "text", text };
}

function paragraph(textValue: string) {
  return { type: "paragraph", content: [text(textValue)] };
}

function heading(level: number, textValue: string) {
  return {
    type: "heading",
    attrs: { level },
    content: [text(textValue)],
  };
}

function bulletList(items: string[]) {
  return {
    type: "bulletList",
    content: items.map((i) => ({
      type: "listItem",
      content: [{ type: "paragraph", content: [text(i)] }],
    })),
  };
}

function orderedList(items: string[]) {
  return {
    type: "orderedList",
    content: items.map((i) => ({
      type: "listItem",
      content: [{ type: "paragraph", content: [text(i)] }],
    })),
  };
}

function buildJiraADFDescription(testCase: any) {
  const content: any[] = [];

  content.push(heading(2, testCase.title));
  content.push(paragraph(`Typ: ${testCase.type}`));
  content.push(paragraph(testCase.description || ""));

  if (testCase.steps?.length) {
    content.push(heading(3, "Testovací kroky"));
    content.push(orderedList(testCase.steps));
  }

  content.push(heading(3, "Očekávaný výsledek"));
  content.push(paragraph(testCase.expectedResult || ""));

  if (testCase.qaInsight) {
    content.push(heading(3, "Expert QA Insight"));
    content.push(heading(4, "Proč je test klíčový"));
    content.push(paragraph(testCase.qaInsight.reasoning || ""));

    if (testCase.qaInsight.coverage?.length) {
      content.push(heading(4, "Pokrytí"));
      content.push(bulletList(testCase.qaInsight.coverage));
    }

    if (testCase.qaInsight.risks?.length) {
      content.push(heading(4, "Rizika"));
      content.push(bulletList(testCase.qaInsight.risks));
    }

    if (testCase.qaInsight.automationTips?.length) {
      content.push(heading(4, "Doporučení pro Playwright"));
      content.push(bulletList(testCase.qaInsight.automationTips));
    }
  }

  return {
    type: "doc",
    version: 1,
    content,
  };
}

/* =========================
   ⭐ JIRA – EXPORT JEDNOHO TEST CASE (ADF)
========================= */
app.post("/api/integrations/jira/export", async (req, res) => {
  const { testCase } = req.body;

  if (!testCase?.title || !testCase?.type) {
    return res.status(400).json({ error: "Neplatný test case." });
  }

  try {
    const response = await fetch(
      `${process.env.JIRA_BASE_URL}/rest/api/3/issue`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
            ).toString("base64"),
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            project: { key: process.env.JIRA_PROJECT_KEY },
            summary: testCase.title,
            issuetype: { name: "Task" },
            description: buildJiraADFDescription(testCase),
            labels: ["qa-thinking-engine", "e2e", "ai-generated"],
          },
        }),
      }
    );

    const data = await response.json();

    res.json({
      issueKey: data.key,
      issueUrl: `${process.env.JIRA_BASE_URL}/browse/${data.key}`,
    });
  } catch (error) {
    console.error("JIRA EXPORT ERROR:", error);
    res.status(500).json({ error: String(error) });
  }
});

/* =========================
   ▶️ PLAYWRIGHT – RUN TEST
========================= */
app.post("/api/tests/run", (req, res) => {
  const { testFile, browser = "firefox" } = req.body;

  if (!testFile || typeof testFile !== "string") {
    return res.status(400).json({ error: "Chybí testFile." });
  }

  const pw = spawn(
    "npx",
    ["playwright", "test", testFile, `--project=${browser}`],
    {
      shell: true,
      env: {
        ...process.env,
      },
    }
  );

  pw.stdout.on("data", (d) => console.log(d.toString()));
  pw.stderr.on("data", (d) => console.error(d.toString()));

  res.json({ status: "started", browser, testFile });
});

/* =========================
   SERVER START
========================= */
app.listen(3000, () => {
  console.log("✅ Backend běží na http://localhost:3000");
});
