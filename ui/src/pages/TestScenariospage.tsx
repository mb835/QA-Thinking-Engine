import { useState } from "react";
import { generateScenario } from "../api/scenariosApi";

type TestCase = {
  id: string;
  title: string;
  description: string;
  preconditions: string[];
  steps: string[];
  expectedResult: string;
  priority: "High" | "Medium" | "Low";
  notes?: string;
  expert: {
    reasoning: string;
    coverage: {
      covers: string[];
      doesNotCover: string[];
    };
    risks: string[];
    automationTips: string[];
  };
};

export default function TestScenariosPage() {
  const [intent, setIntent] = useState("");
  const [testCase, setTestCase] = useState<TestCase | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!intent.trim()) return;

    setLoading(true);
    setError(null);
    setTestCase(null);

    try {
      const res = await generateScenario(intent);
      setTestCase(res.testCase);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 text-white">
      <h1 className="text-2xl font-semibold">Test Scenario Generation</h1>

      {/* INPUT PANEL */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <label className="text-sm text-white/70">Testovací záměr</label>

        <textarea
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          className="w-full h-32 bg-black/40 border border-white/10 rounded-md p-3 text-sm"
          placeholder="Např. Uživatel si koupí notebook na alza.cz"
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50"
        >
          {loading ? "Generuji…" : "Generate Scenario"}
        </button>

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>

      {/* OUTPUT */}
      {testCase && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TEST CASE */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">{testCase.title}</h2>
            <p className="text-sm text-white/70">{testCase.description}</p>

            <section>
              <h3 className="font-medium">📌 Preconditions</h3>
              <ul className="list-disc list-inside text-sm">
                {testCase.preconditions.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="font-medium">📌 Steps</h3>
              <ol className="list-decimal list-inside text-sm">
                {testCase.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </section>

            <section>
              <h3 className="font-medium">📌 Expected Result</h3>
              <p className="text-sm">{testCase.expectedResult}</p>
            </section>

            <p className="text-xs text-white/50">
              Priority: {testCase.priority}
            </p>
          </div>

          {/* EXPERT MODE */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold">🧠 Expert QA Insight</h3>

            <section>
              <h4 className="font-medium">Reasoning</h4>
              <p className="text-sm">{testCase.expert.reasoning}</p>
            </section>

            <section>
              <h4 className="font-medium">Coverage</h4>
              <p className="text-xs text-green-400">
                ✔ Covers: {testCase.expert.coverage.covers.join(", ")}
              </p>
              <p className="text-xs text-red-400">
                ✖ Not covered:{" "}
                {testCase.expert.coverage.doesNotCover.join(", ")}
              </p>
            </section>

            <section>
              <h4 className="font-medium">Risks</h4>
              <ul className="list-disc list-inside text-xs">
                {testCase.expert.risks.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </section>

            <section>
              <h4 className="font-medium">Automation Tips</h4>
              <ul className="list-disc list-inside text-xs">
                {testCase.expert.automationTips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
