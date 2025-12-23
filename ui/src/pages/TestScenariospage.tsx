import { useState } from "react";
import {
  FaClipboardList,
  FaCheckCircle,
  FaListOl,
  FaExclamationTriangle,
  FaLightbulb,
} from "react-icons/fa";

import { generateScenario } from "../api/scenariosApi";
import AiGeneratedBadge from "../components/AiGeneratedBadge";
import LoadingOverlay from "../components/LoadingOverlay";

export default function TestScenariosPage() {
  const [intent, setIntent] = useState("");
  const [scenario, setScenario] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!intent.trim()) return;

    try {
      setLoading(true);
      const data = await generateScenario(intent);
      setScenario(data.testCase);
    } catch (e) {
      console.error(e);
      alert("Chyba při generování scénáře");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-8 py-6 relative">
      {loading && <LoadingOverlay text="Generuji testovací scénář…" />}

      <div className="max-w-7xl mx-auto">
        {/* INPUT */}
        <div className="mb-8 space-y-4">
          <label className="block text-sm text-slate-300">
            Testovací záměr
          </label>

          <textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            rows={4}
            className="
              w-full rounded-lg
              bg-slate-900 border border-slate-700
              p-3 resize-none
              focus:outline-none focus:ring-2 focus:ring-indigo-600
            "
          />

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              className="
                px-5 py-2 rounded-lg
                bg-indigo-600 hover:bg-indigo-700
                transition
              "
            >
              Generate Scenario
            </button>
          </div>
        </div>

        {/* SCENARIO */}
        {scenario && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* LEFT */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 relative">
              <div className="absolute top-4 right-4">
                <AiGeneratedBadge />
              </div>

              <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                <FaClipboardList />
                {scenario.title}
              </h2>

              <p className="text-sm text-slate-400 mb-6">
                {scenario.description}
              </p>

              {/* Preconditions */}
              <div className="mb-6">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <FaCheckCircle className="text-green-400" />
                  Předpoklady
                </h3>
                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                  {scenario.preconditions.map((p: string, i: number) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div className="mb-6">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <FaListOl />
                  Kroky testu
                </h3>
                <ol className="list-decimal list-inside text-sm text-slate-300 space-y-1">
                  {scenario.steps.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>

              {/* Expected */}
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <FaCheckCircle className="text-green-400" />
                  Očekávaný výsledek
                </h3>
                <p className="text-sm text-slate-300">
                  {scenario.expectedResult}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Priorita: {scenario.priority}
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <FaLightbulb className="text-yellow-400" />
                Expert QA Insight
              </h3>

              <div className="mb-4">
                <p className="text-sm text-slate-300">
                  {scenario.expert.reasoning}
                </p>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-1">Coverage</h4>
                <ul className="list-disc list-inside text-sm text-green-400">
                  {scenario.expert.coverage.covers.map(
                    (c: string, i: number) => (
                      <li key={i}>{c}</li>
                    )
                  )}
                </ul>
                <ul className="list-disc list-inside text-sm text-red-400 mt-2">
                  {scenario.expert.coverage.doesNotCover.map(
                    (c: string, i: number) => (
                      <li key={i}>{c}</li>
                    )
                  )}
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold flex items-center gap-2 mb-1">
                  <FaExclamationTriangle className="text-red-400" />
                  Rizika
                </h4>
                <ul className="list-disc list-inside text-sm text-slate-300">
                  {scenario.expert.risks.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-1">
                  Automation tips (Playwright)
                </h4>
                <ul className="list-disc list-inside text-sm text-slate-300">
                  {scenario.expert.automationTips.map(
                    (t: string, i: number) => (
                      <li key={i}>{t}</li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
