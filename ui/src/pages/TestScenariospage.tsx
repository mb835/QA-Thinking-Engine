import { useState } from "react";
import {
  FaClipboardList,
  FaChevronDown,
  FaChevronRight,
  FaSpinner,
  FaLightbulb,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRobot,
  FaBullseye,
} from "react-icons/fa";

import { generateScenario, generateAdditionalSteps } from "../api/scenariosApi";
import { runPlaywright } from "../api/runPlaywrightApi";
import AiGeneratedBadge from "../components/AiGeneratedBadge";
import LoadingOverlay from "../components/LoadingOverlay";

export default function TestScenariosPage() {
  const [intent, setIntent] = useState("");
  const [scenario, setScenario] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);
  const [loadingAdditionalId, setLoadingAdditionalId] = useState<string | null>(
    null
  );
  const [pwLoadingId, setPwLoadingId] = useState<string | null>(null);

  async function handleGenerate() {
    if (!intent.trim()) return;
    try {
      setLoading(true);
      const data = await generateScenario(intent);
      setScenario(data.testCase);
      setShowAdditional(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAdditional(tc: any) {
    if (tc.steps) return;
    try {
      setLoadingAdditionalId(tc.id);
      const data = await generateAdditionalSteps(tc);
      setScenario((prev: any) => ({
        ...prev,
        additionalTestCases: prev.additionalTestCases.map((t: any) =>
          t.id === tc.id ? { ...t, ...data } : t
        ),
      }));
    } finally {
      setLoadingAdditionalId(null);
    }
  }

  async function handleRunPlaywright(tc: any) {
    try {
      setPwLoadingId(tc.id);
      await runPlaywright(tc);
      alert("Playwright test byl vygenerován");
    } catch {
      alert("Chyba při generování Playwright testu");
    } finally {
      setPwLoadingId(null);
    }
  }

  return (
    <div className="px-8 py-6 relative">
      {loading && <LoadingOverlay text="Probíhá QA analýza…" />}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* INPUT */}
        <div>
          <label className="block text-sm text-slate-300 mb-2">
            Testovací záměr
          </label>
          <textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            rows={4}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 resize-none"
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleGenerate}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700"
            >
              Spustit QA analýzu
            </button>
          </div>
        </div>

        {scenario && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* LEFT – ACCEPTANCE TEST */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 relative">
              {/* HEADER */}
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FaClipboardList />
                  {scenario.title}
                </h2>
                <AiGeneratedBadge />
              </div>

              <span className="inline-block text-xs px-2 py-1 rounded bg-emerald-700/20 text-emerald-400 mb-3">
                Akceptační test
              </span>

              <p className="text-sm text-slate-400 mb-4">
                {scenario.description}
              </p>

              <h3 className="font-semibold mb-1">Kroky (Happy Path)</h3>
              <ol className="list-decimal list-inside text-sm space-y-1 mb-4">
                {scenario.steps.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>

              <p className="text-sm mb-4">
                <strong>Očekávaný výsledek:</strong>{" "}
                {scenario.expectedResult}
              </p>

              <button
                onClick={() => handleRunPlaywright(scenario)}
                className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg"
              >
                {pwLoadingId === scenario.id
                  ? "Generuji…"
                  : "Generate Playwright"}
              </button>

              {/* ADDITIONAL TEST CASES */}
              <button
                onClick={() => setShowAdditional(!showAdditional)}
                className="mt-6 flex items-center gap-2 text-sm text-slate-300"
              >
                {showAdditional ? <FaChevronDown /> : <FaChevronRight />}
                Další testovací případy ({scenario.additionalTestCases.length})
              </button>

              {showAdditional && (
                <div className="mt-4 space-y-3">
                  {scenario.additionalTestCases.map((tc: any) => (
                    <div
                      key={tc.id}
                      className="border border-slate-800 bg-slate-950 rounded-lg p-3 cursor-pointer"
                      onClick={() => handleGenerateAdditional(tc)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-semibold">
                          <span className="text-indigo-400 mr-2">
                            {tc.type}
                          </span>
                          {tc.title}
                        </div>

                        {loadingAdditionalId === tc.id && (
                          <FaSpinner className="animate-spin text-indigo-400" />
                        )}
                      </div>

                      {tc.steps && (
                        <div className="mt-3 text-sm">
                          <ol className="list-decimal list-inside space-y-1">
                            {tc.steps.map((s: string, i: number) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ol>

                          <p className="mt-2">
                            <strong>Expected:</strong> {tc.expectedResult}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT – EXPERT QA INSIGHT */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 sticky top-6 h-fit">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <FaLightbulb className="text-yellow-400" />
                Expert QA Insight
              </h3>

              {scenario.qaInsight ? (
                <div className="space-y-6 text-sm">
                  <section>
                    <h4 className="flex items-center gap-2 font-semibold mb-1">
                      <FaBullseye className="text-indigo-400" />
                      Proč je test klíčový
                    </h4>
                    <p>{scenario.qaInsight.reasoning}</p>
                  </section>

                  <section>
                    <h4 className="flex items-center gap-2 font-semibold mb-1">
                      <FaCheckCircle className="text-emerald-400" />
                      Pokrytí
                    </h4>
                    <ul className="list-disc list-inside">
                      {scenario.qaInsight.coverage.map(
                        (c: string, i: number) => (
                          <li key={i}>{c}</li>
                        )
                      )}
                    </ul>
                  </section>

                  <section>
                    <h4 className="flex items-center gap-2 font-semibold mb-1">
                      <FaExclamationTriangle className="text-amber-400" />
                      Rizika
                    </h4>
                    <ul className="list-disc list-inside">
                      {scenario.qaInsight.risks.map((r: string, i: number) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h4 className="flex items-center gap-2 font-semibold mb-1">
                      <FaRobot className="text-indigo-400" />
                      Doporučení pro Playwright
                    </h4>
                    <ul className="list-disc list-inside">
                      {scenario.qaInsight.automationTips.map(
                        (t: string, i: number) => (
                          <li key={i}>{t}</li>
                        )
                      )}
                    </ul>
                  </section>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">
                  Expert QA Insight zatím není k dispozici
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
