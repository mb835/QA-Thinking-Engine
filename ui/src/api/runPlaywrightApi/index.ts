export async function runPlaywright(testCase: any) {
  const res = await fetch("http://localhost:3000/api/run-playwright", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(testCase),
  });

  if (!res.ok) {
    throw new Error("Playwright generation failed");
  }

  return res.json();
}
