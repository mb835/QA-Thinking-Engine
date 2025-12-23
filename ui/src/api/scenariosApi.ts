export async function generateScenario(intent: string) {
  const res = await fetch("http://localhost:3000/api/scenarios", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ intent }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Scenario generation failed");
  }

  return res.json();
}
