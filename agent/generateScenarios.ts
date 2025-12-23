import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateScenarios(testIntent: string) {
  const prompt = `
Jsi senior QA engineer.
Vygeneruj testovací scénáře STRICTNĚ ve formátu JSON.

Použij tuto šablonu:
{
  "id": "LOGIN_TS_001",
  "name": "Validní přihlášení uživatele",
  "description": "...",
  "preconditions": [],
  "steps": [],
  "expectedResult": [],
  "priority": "High",
  "notes": "..."
}

Vygeneruj pole scénářů rozdělené na:
- happyPath
- edgeCases
- negativeTests

Testovací záměr:
"${testIntent}"

Vrať POUZE validní JSON, žádný text navíc.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  return JSON.parse(completion.choices[0].message.content!);
}
