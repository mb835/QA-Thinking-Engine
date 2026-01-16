import { openai } from "./aiClient";

export async function reviewTest(code: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: "Proveď code review:\n" + code }],
  });

  return (response as any).choices[0].message.content;
}