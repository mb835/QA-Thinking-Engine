import { useState } from "react";
import {
  FaClipboardList,
  FaChevronDown,
  FaSpinner,
  FaLightbulb,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRobot,
  FaBullseye,
  FaArrowLeft,
  FaListOl,
  FaMagic,
} from "react-icons/fa";

import { generateScenario, generateAdditionalSteps } from "../api/scenariosApi";
import { runPlaywright } from "../api/runPlaywrightApi";
import AiGeneratedBadge from "../components/AiGeneratedBadge";
import LoadingOverlay from "../components/LoadingOverlay";

export default function TestScenariosPage() {
  const [intent, setIntent] = useState("");
  const [scenario, setScenario] = useState<any>(null);
  const [activeTestCase, setActiveTestCase] = useState<any>(null);

  const [loading, setLoading] = useState(false);
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
      setActiveTestCase(data.testCase);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectAdditional(tc: any) {
    setActiveTestCase(tc);
  }

  async function handleGenerateSteps(tc: any) {
    try {
      setLoadingAdditionalId(tc.id);
      const data = await generateAdditionalSteps(tc);

      setScenario((prev: any) => ({
        ...prev,
        additionalTestCases: prev.additionalTestCases.map((t: any) =>
          t.id === tc.id ? { ...t, ...data } : t
        ),
      }));

      setActiveTestCase((prev: any) =>
        prev?.id === tc.id ? { ...prev, ...data } : prev
      );
    } finally {
      setLoadingAdditionalId(null);
    }
  }

  async function handleRunPlaywright(tc: any) {
    try {
      setPwLoadingId(tc.id);
      await runPlaywright(tc);
      alert("✅ Playwright test byl vygenerován");
    } catch {
      alert("❌ Chyba při generování Playwright testu");
    } finally {
      setPwLoadingId(null);
    }
  }

  const isAcceptance = activeTestCase?.id === scenario?.id;

  // 🔑 KLÍČOVÁ OPRAVA – vždy bereme plný test case ze scénáře
  const resolvedTestCase =
    activeTestCase?.id === scenario?.id
      ? scenario
      : scenario?.additionalTestCases.find(
          (tc: any) => tc.id === activeTestCase?.id
        ) || activeTestCase;

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

        {scenario && resolvedTestCase && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* LEFT */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 relative">
              <div className="absolute top-4 right-4">
                <AiGeneratedBadge status={scenario.meta?.aiStatus} />
              </div>

              {!isAcceptance && (
                <button
                  onClick={() => setActiveTestCase(scenario)}
                  className="mb-4 flex items-center gap-2 text-sm text-indigo-400 hover:underline"
                >
                  <FaArrowLeft /> Zpět na hlavní akceptační test
                </button>
              )}

              <h2 className="text-lg font-semibold flex items-center gap-2 mb-1">
                <FaClipboardList />
                {resolvedTestCase.title}
              </h2>

              <span className="inline-block text-xs px-2 py-1 rounded bg-emerald-700/20 text-emerald-400 mb-3">
                {resolvedTestCase.type}
              </span>

              <p className="text-sm text-slate-400 mb-4">
                {resolvedTestCase.description}
              </p>

              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FaListOl /> Kroky
              </h3>

              {resolvedTestCase.steps ? (
                <ol className="list-decimal list-inside text-sm space-y-1 mb-4">
                  {resolvedTestCase.steps.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              ) : !isAcceptance ? (
                <button
                  onClick={() => handleGenerateSteps(resolvedTestCase)}
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded bg-slate-800 hover:bg-slate-700"
                >
                  {loadingAdditionalId === resolvedTestCase.id ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Generuji kroky…
                    </>
                  ) : (
                    <>
                      <FaMagic />
                      Generate steps
                    </>
                  )}
                </button>
              ) : (
                <p className="text-sm italic text-slate-500">
                  Kroky nejsou k dispozici.
                </p>
              )}

              {resolvedTestCase.expectedResult && (
                <p className="text-sm mt-4">
                  <strong>Očekávaný výsledek:</strong>{" "}
                  {resolvedTestCase.expectedResult}
                </p>
              )}

              <button
                onClick={() => handleRunPlaywright(resolvedTestCase)}
                className="mt-4 px-4 py-2 bg-emerald-600 rounded-lg"
              >
                {pwLoadingId === resolvedTestCase.id
                  ? "Generuji…"
                  : "Generate Playwright"}
              </button>

              {/* ADDITIONAL LIST */}
              <div className="mt-6">
                <h4 className="flex items-center gap-2 text-sm mb-2">
                  <FaChevronDown /> Další testovací případy (
                  {scenario.additionalTestCases.length})
                </h4>

                <div className="space-y-2">
                  {scenario.additionalTestCases.map((tc: any) => (
                    <button
                      key={tc.id}
                      onClick={() => handleSelectAdditional(tc)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        resolvedTestCase.id === tc.id
                          ? "border-indigo-500 bg-slate-800"
                          : "border-slate-800 bg-slate-950 hover:bg-slate-900"
                      }`}
                    >
                      <span className="text-indigo-400 mr-2">{tc.type}</span>
                      {tc.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT – EXPERT QA INSIGHT */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 sticky top-6 h-fit">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <FaLightbulb className="text-yellow-400" />
                Expert QA Insight
              </h3>

              {resolvedTestCase.qaInsight ? (
                <div className="space-y-6 text-sm">
                  <section>
                    <h4 className="flex items-center gap-2 font-semibold mb-1">
                      <FaBullseye className="text-indigo-400" />
                      Proč je test klíčový
                    </h4>
                    <p>{resolvedTestCase.qaInsight.reasoning}</p>
                  </section>

                  <section>
                    <h4 className="flex items-center gap-2 font-semibold mb-1">
                      <FaCheckCircle className="text-emerald-400" />
                      Pokrytí
                    </h4>
                    <ul className="list-disc list-inside">
                      {resolvedTestCase.qaInsight.coverage.map(
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
                      {resolvedTestCase.qaInsight.risks.map(
                        (r: string, i: number) => (
                          <li key={i}>{r}</li>
                        )
                      )}
                    </ul>
                  </section>

                  <section>
                    <h4 className="flex items-center gap-2 font-semibold mb-1">
                      <FaRobot className="text-indigo-400" />
                      Doporučení pro Playwright
                    </h4>
                    <ul className="list-disc list-inside">
                      {resolvedTestCase.qaInsight.automationTips.map(
                        (t: string, i: number) => (
                          <li key={i}>{t}</li>
                        )
                      )}
                    </ul>
                  </section>
                </div>
              ) : (
                <p className="text-sm italic text-slate-400">
                  Expert QA Insight se připravuje…
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
