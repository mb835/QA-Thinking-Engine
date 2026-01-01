import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

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
    const prompt = `
Jsi senior QA automation architekt (enterprise úroveň).
Používáš výhradně Playwright.

Uživatel zadává pouze TESTOVACÍ ZÁMĚR.
Tvým cílem je vytvořit PROFESIONÁLNÍ QA ANALÝZU VHODNOU DO PORTFOLIA.

VYTVOŘ:
1️⃣ PŘESNĚ JEDEN HLAVNÍ AKCEPTAČNÍ TEST (Happy Path)
2️⃣ 5 DALŠÍCH TEST CASE:
   - NEGATIVE
   - EDGE
   - SECURITY
   - UX
   - DATA

VRAŤ POUZE VALIDNÍ JSON V TOMTO FORMÁTU:

{
  "testCase": {
    "id": "TC-ACC-001",
    "title": "Název akceptačního testu",
    "description": "Popis business scénáře",
    "preconditions": ["string"],
    "steps": ["string"],
    "expectedResult": "string",
    "qaInsight": {
      "reasoning": "Proč je tento test klíčový",
      "coverage": ["string"],
      "risks": ["string"],
      "automationTips": ["string"]
    },
    "additionalTestCases": [
      {
        "id": "NEG-1",
        "type": "NEGATIVE",
        "title": "Název testu",
        "description": "Popis rizika"
      }
    ]
  }
}

TESTOVACÍ ZÁMĚR:
"${intent}"

Odpověď MUSÍ být výhradně JSON.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Musíš odpovědět výhradně jako validní JSON objekt. Nepřidávej žádný text mimo JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      throw new Error("AI nevrátila žádný obsah.");
    }

    const parsed = JSON.parse(content);

    // 🧠 HARD VALIDACE KONTRAKTU
    if (!parsed.testCase || !parsed.testCase.qaInsight) {
      throw new Error("Neplatná struktura odpovědi AI.");
    }

    res.json(parsed);
  } catch (error: any) {
    console.error("AI ERROR:", error);
    res.status(500).json({
      error: "Chyba při generování QA analýzy",
      details: error.message,
    });
  }
});

/* =========================
   AI – GENERATE STEPS FOR ADDITIONAL TEST CASE
   ========================= */
app.post("/api/scenarios/additional/steps", async (req, res) => {
  const { additionalTestCase } = req.body;

  if (!additionalTestCase?.type || !additionalTestCase?.title) {
    return res.status(400).json({ error: "Neplatný test case." });
  }

  try {
    const prompt = `
Jsi senior QA automation expert.
Používáš výhradně Playwright.

Vygeneruj detailní testovací kroky pro tento test:

TYP: ${additionalTestCase.type}
NÁZEV: ${additionalTestCase.title}
POPIS: ${additionalTestCase.description}

VRAŤ POUZE JSON:

{
  "steps": ["string"],
  "expectedResult": "string"
}

Odpověď musí být validní JSON.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Odpověz výhradně jako JSON objekt. Žádný jiný text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      throw new Error("AI nevrátila žádný obsah.");
    }

    res.json(JSON.parse(content));
  } catch (error: any) {
    console.error("AI ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   SERVER START
   ========================= */
app.listen(3000, () => {
  console.log("✅ Backend běží na http://localhost:3000");
});
