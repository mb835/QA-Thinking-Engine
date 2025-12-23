import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { spawn } from "child_process";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   OPENAI CLIENT
   ========================= */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =========================
   HEALTH CHECK
   ========================= */
app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

/* =========================
   AI – GENERATE TEST SCENARIO
   ========================= */
app.post("/api/scenarios", async (req, res) => {
  const { intent } = req.body;

  if (!intent || typeof intent !== "string") {
    return res.status(400).json({
      error: "Chybí nebo je neplatný testovací záměr.",
    });
  }

  try {
    const prompt = `
Jsi senior QA automation expert (enterprise level, rok 2027).

DŮLEŽITÉ TECHNICKÉ OMEZENÍ:
- Projekt používá VÝHRADNĚ Playwright
- Selenium, Cypress ani jiné frameworky NESMÍŠ použít
- Veškerá doporučení musí být:
  - Playwright-first
  - TypeScript-oriented
  - vhodná pro E2E testy moderních webových aplikací

PRAVIDLA:
- Odpovídej POUZE validním JSONem
- Žádný text mimo JSON
- Piš česky
- Buď strukturovaný, konzistentní, realistický
- Test case musí být reálně použitelný v praxi
- Nepoužívej Selenium, Cypress ani jiné nástroje – pouze Playwright

VRAŤ PŘESNĚ TUTO STRUKTURU:

{
  "testCase": {
    "id": "TC_UNIQUE_ID",
    "title": "Krátký výstižný název",
    "description": "Co test ověřuje",
    "preconditions": string[],
    "steps": string[],
    "expectedResult": "Očekávaný výsledek",
    "priority": "High | Medium | Low",
    "notes": string,
    "expert": {
      "reasoning": "Proč jsou tyto kroky zvoleny",
      "coverage": {
        "covers": string[],
        "doesNotCover": string[]
      },
      "risks": string[],
      "automationTips": string[]
    }
  }
}

TESTOVACÍ ZÁMĚR:
"${intent}"
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Jsi přísný senior QA automation architekt. Dodržuj striktně Playwright-only přístup.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;

    if (!raw) {
      throw new Error("AI nevrátila žádnou odpověď.");
    }

    // 🔒 Backend = zdroj pravdy
    const parsed = JSON.parse(raw);

    if (!parsed.testCase || !parsed.testCase.expert) {
      throw new Error("Neplatná struktura test case.");
    }

    res.json(parsed);
  } catch (error: any) {
    console.error("AI ERROR:", error.message);

    res.status(500).json({
      error: "Chyba při generování testovacího scénáře.",
      details: error.message,
    });
  }
});

/* =========================
   PLAYWRIGHT – RUN TESTS
   ========================= */
app.post("/api/tests/run", (req, res) => {
  const { testFile } = req.body;

  if (!testFile) {
    return res.status(400).json({ error: "Chybí testFile." });
  }

  const pw = spawn("npx", ["playwright", "test", testFile], {
    shell: true,
    env: {
      ...process.env,
    },
  });

  pw.stdout.on("data", (d) => console.log(d.toString()));
  pw.stderr.on("data", (d) => console.error(d.toString()));

  res.json({ status: "started" });
});

/* =========================
   SERVER START
   ========================= */
app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
