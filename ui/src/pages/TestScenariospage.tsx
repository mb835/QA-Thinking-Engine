import { useEffect, useState } from "react";
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
  exportScenarioToJira,
  exportToJira,
} from "../api/scenariosApi";

import { runPlaywright } from "../api/runPlaywrightApi";
import AiGeneratedBadge from "../components/AiGeneratedBadge";
import LoadingOverlay from "../components/LoadingOverlay";

type JiraIssue = { key: string; url: string };

type ScenarioJiraResult = {
  epic: JiraIssue;
  tasks: { id: string; key: string; url: string }[];
};

export default function TestScenariosPage() {
  const [intent, setIntent] = useState("");
  const [scenario, setScenario] = useState<any>(null);
  const [activeTestCase, setActiveTestCase] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [loadingStepsId, setLoadingStepsId] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [pwLoadingId, setPwLoadingId] = useState<string | null>(null);

  const [scenarioExportLoading, setScenarioExportLoading] = useState(false);
  const [scenarioJiraResult, setScenarioJiraResult] =
    useState<ScenarioJiraResult | null>(null);

  const [singleJiraResults, setSingleJiraResults] = useState<
    Record<string, JiraIssue>
  >({});

  // ASYNC EXPORT JOB STATE
  const [exportJobId, setExportJobId] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<any>(null);

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
      setScenarioJiraResult(null);
      setSingleJiraResults({});
    } catch (e) {
      console.error(e);
      alert("❌ Chyba při generování scénáře");
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

      const sourceTc =
        scenario?.additionalTestCases?.find((t: any) => t.id === tc.id) || tc;

      const data = await generateAdditionalSteps(sourceTc);

      setScenario((prev: any) => ({
        ...prev,
        additionalTestCases: prev.additionalTestCases.map((t: any) =>
          t.id === tc.id ? { ...t, ...data } : t
        ),
      }));

      setActiveTestCase((prev: any) => ({ ...prev, ...data }));
    } catch (e) {
      console.error(e);
      alert("❌ Chyba při generování kroků");
    } finally {
      setLoadingStepsId(null);
    }
  }

  /* =========================
     GENERATE INSIGHT
  ========================= */
  async function handleGenerateInsight(tc: any) {
    try {
      setLoadingInsight(true);

      const sourceTc =
        scenario?.additionalTestCases?.find((t: any) => t.id === tc.id) || tc;

      const data = await generateExpertInsight(sourceTc);

      setScenario((prev: any) => {
        if (prev.id === tc.id) return { ...prev, qaInsight: data.qaInsight };

        return {
          ...prev,
          additionalTestCases: prev.additionalTestCases.map((t: any) =>
            t.id === tc.id ? { ...t, qaInsight: data.qaInsight } : t
          ),
        };
      });

      setActiveTestCase((prev: any) => ({ ...prev, qaInsight: data.qaInsight }));
    } catch (e) {
      console.error(e);
      alert("❌ Chyba při generování Expert QA Insight");
    } finally {
      setLoadingInsight(false);
    }
  }

  /* =========================
     PLAYWRIGHT
  ========================= */
  async function handleRunPlaywright(tc: any) {
    try {
      setPwLoadingId(tc.id);
      await runPlaywright(tc);
      alert("✅ Playwright test byl vygenerován");
    } catch (e) {
      console.error(e);
      alert("❌ Chyba při generování Playwright testu");
    } finally {
      setPwLoadingId(null);
    }
  }

  function handleDownloadSpec(tc: any) {
    downloadPlaywrightSpec(tc);
  }

  /* =========================
     SINGLE JIRA EXPORT
  ========================= */
  async function handleExportSingleTestCase(tc: any) {
    try {
      const sourceTc =
        scenario?.additionalTestCases?.find((t: any) => t.id === tc.id) || tc;

      const result = await exportToJira(sourceTc);
      setSingleJiraResults((prev) => ({
        ...prev,
        [tc.id]: { key: result.issueKey, url: result.issueUrl },
      }));
    } catch (e) {
      console.error(e);
      alert("❌ Chyba při exportu test case do JIRA");
    }
  }

  /* =========================
     SCENARIO JIRA EXPORT (ASYNC JOB)
  ========================= */
  async function handleExportWholeScenario() {
    if (!scenario) return;

    try {
      setScenarioExportLoading(true);
      setScenarioJiraResult(null);
      setExportStatus(null);

      const res = await fetch(
        "http://localhost:3000/api/integrations/jira/export-scenario",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ testCase: scenario }),
        }
      );

      const data = await res.json();
      setExportJobId(data.jobId);
    } catch (e) {
      console.error(e);
      alert("❌ Chyba při spuštění exportu scénáře do JIRA");
      setScenarioExportLoading(false);
    }
  }

  /* =========================
     EXPORT STATUS POLLING
  ========================= */
  useEffect(() => {
    if (!exportJobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/integrations/jira/export-status/${exportJobId}`
        );
        const data = await res.json();

        setExportStatus(data);

        if (data.status === "done") {
          setScenarioJiraResult(data.result || null);
          setScenarioExportLoading(false);
          clearInterval(interval);
        }

        if (data.status === "error") {
          alert("❌ Export do JIRA selhal – zkontroluj backend log");
          setScenarioExportLoading(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling failed:", err);
        setScenarioExportLoading(false);
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [exportJobId]);

  /* =========================
     DERIVED
  ========================= */
  const isAcceptance = activeTestCase?.id === scenario?.id;
  const hasSteps = Array.isArray(activeTestCase?.steps);

  const hasFullInsight =
    activeTestCase?.qaInsight &&
    activeTestCase.qaInsight.reasoning &&
    activeTestCase.qaInsight.coverage?.length > 0 &&
    activeTestCase.qaInsight.risks?.length > 0 &&
    activeTestCase.qaInsight.automationTips?.length > 0;

  const taskForActive =
    scenarioJiraResult?.tasks?.find((t) => t.id === activeTestCase?.id) || null;

  const singleExport = singleJiraResults[activeTestCase?.id];

  return (
    <div className="px-8 py-6 relative">
      {loading && <LoadingOverlay />}

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
          <div className="flex justify-between mt-3">
            <button
              onClick={handleGenerateScenario}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700"
            >
              Spustit QA analýzu
            </button>

            {scenario && (
              <button
                onClick={handleExportWholeScenario}
                disabled={scenarioExportLoading}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700"
              >
                <FaJira className="inline mr-2" />
                {scenarioExportLoading
                  ? "Exportuji celý scénář…"
                  : "Exportovat celý scénář do JIRA"}
              </button>
            )}
          </div>

          {/* PROGRESS BAR */}
          {exportStatus && exportStatus.status === "running" && (
            <div className="mt-4">
              <div className="text-xs mb-1 text-slate-400">
                Export do JIRA: {exportStatus.done} / {exportStatus.total}
              </div>
              <div className="w-full bg-slate-800 rounded h-2">
                <div
                  className="bg-emerald-500 h-2 rounded transition-all"
                  style={{
                    width: `${
                      exportStatus.total
                        ? (exportStatus.done / exportStatus.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          {scenarioJiraResult && (
            <div className="mt-3 text-sm text-emerald-400">
              ✅ Epic vytvořen:{" "}
              <a
                href={scenarioJiraResult.epic.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline inline-flex items-center gap-1"
              >
                {scenarioJiraResult.epic.key}
                <FaExternalLinkAlt />
              </a>
            </div>
          )}
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

              {singleExport && (
                <div className="mb-3 text-xs text-emerald-400">
                  ✅ Exportováno do JIRA:{" "}
                  <a
                    href={singleExport.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline inline-flex items-center gap-1"
                  >
                    {singleExport.key}
                    <FaExternalLinkAlt />
                  </a>
                </div>
              )}

              {taskForActive && (
                <div className="mb-3 text-xs text-emerald-400">
                  ✅ Součást scénáře:{" "}
                  <a
                    href={taskForActive.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline inline-flex items-center gap-1"
                  >
                    {taskForActive.key}
                    <FaExternalLinkAlt />
                  </a>
                </div>
              )}

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
                  Stáhnout Playwright test
                </button>

                <button
                  onClick={() => handleExportSingleTestCase(activeTestCase)}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700"
                >
                  <FaJira className="inline mr-2" />
                  Exportovat test case do JIRA
                </button>
              </div>

              {/* ADDITIONAL */}
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

            {/* RIGHT */}
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
