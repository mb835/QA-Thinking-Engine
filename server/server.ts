import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fetch from "node-fetch";
import { randomUUID } from "crypto";

/* =========================
   ENV INIT
========================= */
dotenv.config();

console.log("👉 JIRA PROJECT KEY:", process.env.JIRA_PROJECT_KEY);

const app = express();
app.use(cors());
app.use(express.json());

console.log("🔥 SERVER VERSION: JIRA EXPORT ASYNC + PROGRESS + PARALLEL AI");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =========================
   IN-MEMORY JOB STORE
========================= */

type ExportJob = {
  id: string;
  total: number;
  done: number;
  status: "running" | "done" | "error";
  result?: any;
  error?: any;
};

const exportJobs: Record<string, ExportJob> = {};

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
   RETRY HELPER
========================= */

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    console.warn("🔁 AI retry...");
    return withRetry(fn, retries - 1);
  }
}

/* =========================
   AI HELPERS
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

async function generateStepsForTest(testCase: any) {
  const prompt = `
VRAŤ POUZE VALIDNÍ JSON.

Jsi senior QA automation expert.
Používáš Playwright.

Vygeneruj kroky pro test:

TYP: ${testCase.type}
NÁZEV: ${testCase.title}
POPIS: ${testCase.description}

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

  const parsed = JSON.parse(content);

  return {
    ...testCase,
    steps: parsed.steps,
    expectedResult: parsed.expectedResult || testCase.expectedResult,
  };
}

async function generateInsightForTest(testCase: any) {
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

  return JSON.parse(content);
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
   JIRA ADF HELPERS
========================= */

function textNode(text: string) {
  return { type: "text", text };
}

function paragraph(text: string) {
  return { type: "paragraph", content: [textNode(text)] };
}

function heading(text: string) {
  return {
    type: "heading",
    attrs: { level: 3 },
    content: [textNode(text)],
  };
}

function bulletList(items: string[]) {
  return {
    type: "bulletList",
    content: items.map((i) => ({
      type: "listItem",
      content: [{ type: "paragraph", content: [textNode(i)] }],
    })),
  };
}

function orderedList(items: string[]) {
  return {
    type: "orderedList",
    content: items.map((i) => ({
      type: "listItem",
      content: [{ type: "paragraph", content: [textNode(i)] }],
    })),
  };
}

function buildJiraADF(testCase: any) {
  const content: any[] = [];

  content.push(heading(testCase.title));
  content.push(paragraph(`Typ: ${testCase.type}`));
  content.push(paragraph(testCase.description || ""));

  if (testCase.steps?.length) {
    content.push(heading("Testovací kroky"));
    content.push(orderedList(testCase.steps));
  }

  content.push(heading("Očekávaný výsledek"));
  content.push(paragraph(testCase.expectedResult || ""));

  if (testCase.qaInsight) {
    content.push(heading("Expert QA Insight"));

    content.push(heading("Proč je test klíčový"));
    content.push(paragraph(testCase.qaInsight.reasoning || ""));

    if (testCase.qaInsight.coverage?.length) {
      content.push(heading("Pokrytí"));
      content.push(bulletList(testCase.qaInsight.coverage));
    }

    if (testCase.qaInsight.risks?.length) {
      content.push(heading("Rizika"));
      content.push(bulletList(testCase.qaInsight.risks));
    }

    if (testCase.qaInsight.automationTips?.length) {
      content.push(heading("Doporučení pro Playwright"));
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
   JIRA ISSUE TYPE RESOLVER
========================= */

async function getProjectIssueTypes() {
  const res = await fetch(
    `${process.env.JIRA_BASE_URL}/rest/api/3/project/${process.env.JIRA_PROJECT_KEY}`,
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
          ).toString("base64"),
        Accept: "application/json",
      },
    }
  );

  const data = await res.json();
  if (!res.ok) throw data;
  return data.issueTypes;
}

async function resolveIssueTypes() {
  const types = await getProjectIssueTypes();

  const epicType =
    types.find((t: any) => t.hierarchyLevel === 1) || types[0];

  const taskType =
    types.find((t: any) => t.hierarchyLevel === 0) || types[0];

  console.log("🟣 JIRA EPIC TYPE:", epicType.name, epicType.id);
  console.log("🔵 JIRA TASK TYPE:", taskType.name, taskType.id);

  return { epicType, taskType };
}

/* =========================
   JIRA CREATE ISSUE
========================= */
async function createJiraIssue(fields: any) {
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
      body: JSON.stringify({ fields }),
    }
  );

  const data = await response.json();
  if (!response.ok) throw data;
  return data;
}

/* =========================
   ⭐ START ASYNC EXPORT JOB
========================= */
app.post("/api/integrations/jira/export-scenario", async (req, res) => {
  const { testCase } = req.body;

  const jobId = randomUUID();

  exportJobs[jobId] = {
    id: jobId,
    total: 0,
    done: 0,
    status: "running",
  };

  res.json({ jobId });

  (async () => {
    try {
      const { epicType, taskType } = await resolveIssueTypes();

      let allCases = [testCase, ...(testCase.additionalTestCases || [])];

      exportJobs[jobId].total = allCases.length * 2 + 1;

      const enriched = await Promise.all(
        allCases.map(async (tc) => {
          let updated = tc;

          if (!updated.steps?.length) {
            updated = await withRetry(() => generateStepsForTest(updated), 2);
          }
          exportJobs[jobId].done++;

          if (!updated.qaInsight) {
            updated.qaInsight = await withRetry(
              () => generateInsightForTest(updated),
              2
            );
          }
          exportJobs[jobId].done++;

          return updated;
        })
      );

      const epic = await createJiraIssue({
        project: { key: process.env.JIRA_PROJECT_KEY },
        summary: `[SCENARIO] ${testCase.title}`,
        issuetype: { id: epicType.id },
        description: {
          type: "doc",
          version: 1,
          content: [
            heading(testCase.title),
            paragraph(testCase.description || ""),
          ],
        },
      });

      exportJobs[jobId].done++;

      const tasks = [];

      for (const tc of enriched) {
        const task = await createJiraIssue({
          project: { key: process.env.JIRA_PROJECT_KEY },
          summary: `[${tc.type}] ${tc.title}`,
          issuetype: { id: taskType.id },
          parent: { key: epic.key },
          description: buildJiraADF(tc),
        });

        tasks.push({
          id: tc.id,
          key: task.key,
          url: `${process.env.JIRA_BASE_URL}/browse/${task.key}`,
        });
      }

      exportJobs[jobId].status = "done";
      exportJobs[jobId].result = {
        epic: {
          key: epic.key,
          url: `${process.env.JIRA_BASE_URL}/browse/${epic.key}`,
        },
        tasks,
      };
    } catch (err) {
      console.error("❌ EXPORT JOB FAILED:", err);
      exportJobs[jobId].status = "error";
      exportJobs[jobId].error = err;
    }
  })();
});

/* =========================
   ⭐ EXPORT STATUS
========================= */
app.get("/api/integrations/jira/export-status/:id", (req, res) => {
  const job = exportJobs[req.params.id];

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.json(job);
});

/* =========================
   SERVER START
========================= */
app.listen(3000, () => {
  console.log("✅ Backend běží na http://localhost:3000");
});
