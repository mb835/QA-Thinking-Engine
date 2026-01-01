import OpenAI from "openai";
import { ScenarioResponse, TestCase } from "./types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateScenario(
  testIntent: string
): Promise<ScenarioResponse> {
  const prompt = `
Jsi senior QA engineer.

Vygeneruj QA analýzu STRICTNĚ ve VALIDNÍM JSON formátu.
NEVYPISUJ žádný text mimo JSON.

Použij PŘESNĚ tuto strukturu:

{
  "acceptanceTest": {
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
    }
  },
  "additionalTests": [
    {
      "type": "NEGATIVE | EDGE | SECURITY | UX | DATA",
      "title": "",
      "description": "",
      "qaInsight": {
        "reasoning": "",
        "coverage": [],
        "risks": [],
        "automationTips": []
      }
    }
  ]
}

Testovací záměr:
"${testIntent}"
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  const raw = completion.choices[0].message.content;
  if (!raw) {
    throw new Error("OpenAI returned empty response");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("❌ Invalid JSON from OpenAI:", raw);
    throw new Error("Failed to parse OpenAI response");
  }

  // ---------- MAPOVÁNÍ NA INTERNÍ MODEL ----------

  const acceptanceTest: TestCase = {
    id: "ACC-1",
    type: "ACCEPTANCE",
    title: parsed.acceptanceTest.title,
    description: parsed.acceptanceTest.description,
    preconditions: parsed.acceptanceTest.preconditions,
    steps: parsed.acceptanceTest.steps,
    expectedResult: parsed.acceptanceTest.expectedResult,
    qaInsight: parsed.acceptanceTest.qaInsight,
  };

  const additionalTestCases: TestCase[] = parsed.additionalTests.map(
    (t: any, index: number) => ({
      id: `${t.type}-${index + 1}`,
      type: t.type,
      title: t.title,
      description: t.description,
      qaInsight: t.qaInsight,
    })
  );

  return {
    testCase: acceptanceTest,
    additionalTestCases,
  };
}
