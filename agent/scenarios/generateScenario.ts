import OpenAI from "openai";
import { TestCase } from "./types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateScenario(
  intent: string
): Promise<{ testCase: TestCase }> {
  const prompt = `
Jsi senior QA engineer.

Vygeneruj QA analýzu STRICTNĚ v VALIDNÍM JSON formátu.
NEVYPISUJ žádný text mimo JSON.

Použij PŘESNĚ tuto strukturu:

{
  "testCase": {
    "id": "ACCEPTANCE_001",
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
    "additionalTestCases": [
      {
        "id": "NEG_001",
        "type": "NEGATIVE",
        "title": "",
        "description": ""
      }
    ]
  }
}

Testovací záměr:
"${intent}"
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("AI nevrátila odpověď");
  }

  return JSON.parse(content);
}
