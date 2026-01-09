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
  FaDownload,
  FaJira,
  FaExternalLinkAlt,
} from "react-icons/fa";

import {
  generateScenario,
  generateAdditionalSteps,
  generateExpertInsight,
  downloadPlaywrightSpec,
  exportToJira,
} from "../api/scenariosApi";
import { runPlaywright } from "../api/runPlaywrightApi";
import AiGeneratedBadge from "../components/AiGeneratedBadge";
import LoadingOverlay from "../components/LoadingOverlay";

type JiraExportResult = {
  issueKey: string;
  issueUrl: string;
};

export default function TestScenariosPage() {
  const [intent, setIntent] = useState("");
  const [scenario, setScenario] = useState<any>(null);
  const [activeTestCase, setActiveTestCase] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [loadingStepsId, setLoadingStepsId] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [pwLoadingId, setPwLoadingId] = useState<string | null>(null);
  const [jiraLoadingId, setJiraLoadingId] = useState<string | null>(null);

  // ✅ JIRA RESULT PER TEST CASE
  const [jiraResults, setJiraResults] = useState<
    Record<string, JiraExportResult>
  >({});

  /* =========================
     GENERATE SCENARIO
  ========================= */
  async function handleGenerateScenario() {
    if (!intent.trim()) return;

    try {
      setLoading(true);
      const data = await generateScenario(intent);
      setScenario(data.testCase);
      setActiveTestCase(data.testCase);
      setJiraResults({});
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     GENERATE STEPS
  ========================= */
  async function handleGenerateSteps(tc: any) {
    try {
      setLoadingStepsId(tc.id);
      const data = await generateAdditionalSteps(tc);

      setScenario((prev: any) => ({
        ...prev,
        additionalTestCases: prev.additionalTestCases.map((t: any) =>
          t.id === tc.id ? { ...t, ...data } : t
        ),
      }));

      setActiveTestCase((prev: any) => ({
        ...prev,
        ...data,
      }));
    } finally {
      setLoadingStepsId(null);
    }
  }

  /* =========================
     GENERATE / COMPLETE EXPERT INSIGHT
  ========================= */
  async function handleGenerateInsight(tc: any) {
    try {
      setLoadingInsight(true);
      const data = await generateExpertInsight(tc);

      setScenario((prev: any) => {
        if (prev.id === tc.id) {
          return { ...prev, qaInsight: data.qaInsight };
        }

        return {
          ...prev,
          additionalTestCases: prev.additionalTestCases.map((t: any) =>
            t.id === tc.id ? { ...t, qaInsight: data.qaInsight } : t
          ),
        };
      });

      setActiveTestCase((prev: any) => ({
        ...prev,
        qaInsight: data.qaInsight,
      }));
    } finally {
      setLoadingInsight(false);
    }
  }

  /* =========================
     PLAYWRIGHT – INTERNAL
  ========================= */
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

  /* =========================
     PLAYWRIGHT – DOWNLOAD
  ========================= */
  function handleDownloadSpec(tc: any) {
    downloadPlaywrightSpec(tc);
  }

  /* =========================
     JIRA EXPORT – PER TEST CASE
  ========================= */
  async function handleExportToJira(tc: any) {
    try {
      setJiraLoadingId(tc.id);

      const result = await exportToJira(tc);

      setJiraResults((prev) => ({
        ...prev,
        [tc.id]: result,
      }));
    } catch {
      alert("❌ Chyba při exportu do JIRA");
    } finally {
      setJiraLoadingId(null);
    }
  }

  /* =========================
     DERIVED STATE
  ========================= */
  const isAcceptance = activeTestCase?.id === scenario?.id;
  const hasSteps = Array.isArray(activeTestCase?.steps);

  const hasFullInsight =
    activeTestCase?.qaInsight &&
    activeTestCase.qaInsight.reasoning &&
    activeTestCase.qaInsight.coverage?.length > 0 &&
    activeTestCase.qaInsight.risks?.length > 0 &&
    activeTestCase.qaInsight.automationTips?.length > 0;

  const jiraResultForActive = activeTestCase
    ? jiraResults[activeTestCase.id]
    : null;

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
              onClick={handleGenerateScenario}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700"
            >
              Spustit QA analýzu
            </button>
          </div>
        </div>

        {scenario && activeTestCase && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* LEFT */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 relative">
              <div className="absolute top-4 right-4">
                <AiGeneratedBadge />
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
                {activeTestCase.title}
              </h2>

              <span className="inline-block text-xs px-2 py-1 rounded bg-emerald-700/20 text-emerald-400 mb-3">
                {activeTestCase.type}
              </span>

              <p className="text-sm text-slate-400 mb-4">
                {activeTestCase.description}
              </p>

              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FaListOl /> Kroky
              </h3>

              {loadingStepsId === activeTestCase.id ? (
                <div className="text-sm text-slate-400 flex items-center gap-2">
                  <FaSpinner className="animate-spin" />
                  Generuji kroky…
                </div>
              ) : hasSteps ? (
                <ol className="list-decimal list-inside text-sm space-y-1 mb-4">
                  {activeTestCase.steps.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              ) : (
                <button
                  onClick={() => handleGenerateSteps(activeTestCase)}
                  className="text-sm px-3 py-2 rounded bg-slate-800 hover:bg-slate-700"
                >
                  <FaMagic className="inline mr-2" />
                  Generovat kroky
                </button>
              )}

              <p className="text-sm mb-4">
                <strong>Očekávaný výsledek:</strong>{" "}
                {activeTestCase.expectedResult}
              </p>

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  disabled={!hasSteps}
                  onClick={() => handleRunPlaywright(activeTestCase)}
                  className={`px-4 py-2 rounded-lg ${
                    hasSteps
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-slate-700 cursor-not-allowed"
                  }`}
                >
                  Generovat Playwright test
                </button>

                <button
                  disabled={!hasSteps}
                  onClick={() => handleDownloadSpec(activeTestCase)}
                  className={`px-4 py-2 rounded-lg ${
                    hasSteps
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-slate-700 cursor-not-allowed"
                  }`}
                >
                  <FaDownload className="inline mr-2" />
                  Stáhnout Playwright test (.spec.ts)
                </button>

                <button
                  onClick={() => handleExportToJira(activeTestCase)}
                  disabled={jiraLoadingId === activeTestCase.id}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                >
                  <FaJira className="inline mr-2" />
                  {jiraLoadingId === activeTestCase.id
                    ? "Exportuji do JIRA…"
                    : "Exportovat test case do JIRA"}
                </button>
              </div>

              {jiraResultForActive && (
                <div className="mt-4 text-sm bg-slate-800 border border-slate-700 rounded-lg p-3">
                  <span className="text-emerald-400 font-semibold">
                    JIRA issue vytvořeno:
                  </span>{" "}
                  <a
                    href={jiraResultForActive.issueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 underline inline-flex items-center gap-1"
                  >
                    {jiraResultForActive.issueKey}
                    <FaExternalLinkAlt />
                  </a>
                </div>
              )}

              {/* ADDITIONAL TEST CASES */}
              <div className="mt-6">
                <h4 className="flex items-center gap-2 text-sm mb-2">
                  <FaChevronDown /> Další testovací případy (
                  {scenario.additionalTestCases.length})
                </h4>

                <div className="space-y-2">
                  {scenario.additionalTestCases.map((tc: any) => (
                    <button
                      key={tc.id}
                      onClick={() => setActiveTestCase(tc)}
                      className={`w-full text-left p-3 rounded-lg border ${
                        activeTestCase.id === tc.id
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
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <FaLightbulb className="text-yellow-400" />
                Expert QA Insight
              </h3>

              {hasFullInsight ? (
                <div className="space-y-6 text-sm">
                  <section>
                    <h4 className="flex items-center gap-2 font-semibold mb-1">
                      <FaBullseye className="text-indigo-400" />
                      Proč je test klíčový
                    </h4>
                    <p>{activeTestCase.qaInsight.reasoning}</p>
                  </section>

                  <section>
                    <h4 className="flex items-center gap-2 font-semibold mb-1">
                      <FaCheckCircle className="text-emerald-400" />
                      Pokrytí
                    </h4>
                    <ul className="list-disc list-inside">
                      {activeTestCase.qaInsight.coverage.map(
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
                      {activeTestCase.qaInsight.risks.map(
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
                      {activeTestCase.qaInsight.automationTips.map(
                        (t: string, i: number) => (
                          <li key={i}>{t}</li>
                        )
                      )}
                    </ul>
                  </section>
                </div>
              ) : (
                <button
                  onClick={() => handleGenerateInsight(activeTestCase)}
                  disabled={loadingInsight}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700"
                >
                  {loadingInsight
                    ? "Generuji Expert QA Insight…"
                    : "Generovat Expert QA Insight"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
