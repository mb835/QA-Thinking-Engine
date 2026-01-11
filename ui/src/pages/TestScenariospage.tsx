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

/* =========================
   TEST TYPE STYLES
========================= */
function getTestTypeStyle(type: string) {
  switch (type?.toLowerCase()) {
    case "acceptance":
      return {
        label: "Akceptační",
        color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/40",
        icon: "✅",
      };

    case "negative":
      return {
        label: "Negativní",
        color: "text-red-400 bg-red-500/15 border-red-500/40",
        icon: "⚠",
      };

    case "edge":
      return {
        label: "Hraniční",
        color: "text-amber-400 bg-amber-500/15 border-amber-500/40",
        icon: "🧪",
      };

    case "security":
      return {
        label: "Bezpečnostní",
        color: "text-purple-400 bg-purple-500/15 border-purple-500/40",
        icon: "🔒",
      };

    case "ux":
      return {
        label: "Uživatelský (UX)",
        color: "text-sky-400 bg-sky-500/15 border-sky-500/40",
        icon: "👁",
      };

    case "data":
      return {
        label: "Datový",
        color: "text-indigo-400 bg-indigo-500/15 border-indigo-500/40",
        icon: "🗄",
      };

    default:
      return {
        label: type?.toUpperCase() || "Test",
        color: "text-slate-400 bg-slate-500/10 border-slate-500/30",
        icon: "🧩",
      };
  }
}

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

  const [exportJobId, setExportJobId] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<any>(null);

  /* =========================
     DERIVED EXPORT STATE
  ========================= */
  const isScenarioExportRunning =
    scenarioExportLoading || exportStatus?.status === "running";

  const isScenarioAlreadyExported = !!scenarioJiraResult;

  const blockSingleExport =
    isScenarioExportRunning || isScenarioAlreadyExported;

  const exportProgress =
    exportStatus?.total > 0
      ? Math.round((exportStatus.done / exportStatus.total) * 100)
      : 0;

  async function handleGenerateScenario() {
    if (!intent.trim()) return;

    try {
      setLoading(true);
      const data = await generateScenario(intent);
      setScenario(data.testCase);
      setActiveTestCase(data.testCase);
      setScenarioJiraResult(null);
      setSingleJiraResults({});
      setExportStatus(null);
      setExportJobId(null);
    } catch (e) {
      console.error(e);
      alert("❌ Chyba při generování scénáře");
    } finally {
      setLoading(false);
    }
  }

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

  async function handleExportSingleTestCase(tc: any) {
    if (blockSingleExport) return;

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

  async function handleExportWholeScenario() {
    if (!scenario || isScenarioExportRunning) return;

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

        {/* HEADER */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-wide text-white">
            Testovací scénáře
          </h1>
          <p className="text-sm text-slate-400">
            Zadej záměr a AI navrhne kompletní test design
          </p>
        </div>

        {/* INPUT */}
        <div>
          <label className="block text-sm text-slate-300 mb-2">
            Testovací záměr
          </label>

          <div className="neon-wrap">
            <textarea
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              rows={4}
              placeholder="Popiš, co chceš otestovat…"
              className="neon-input"
            />
          </div>

          {/* BUTTON ROW */}
          <div className="flex justify-between items-start mt-4 gap-4">
            <button
              onClick={handleGenerateScenario}
              className="neon-button neon-pulse"
            >
              <span className="relative z-10">Spustit QA analýzu</span>
            </button>

            {scenario && (
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={handleExportWholeScenario}
                  disabled={isScenarioExportRunning}
                  className={`px-5 py-2 rounded-lg ${
                    isScenarioExportRunning
                      ? "bg-slate-700 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  <FaJira className="inline mr-2" />
                  {isScenarioExportRunning
                    ? "Exportuji celý scénář…"
                    : "Exportovat celý scénář do JIRA"}
                </button>

                {isScenarioExportRunning && exportStatus && (
                  <div className="w-72">
                    <div className="h-2 bg-slate-800 rounded overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${exportProgress}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-400 text-right mt-1">
                      {exportStatus.done}/{exportStatus.total} ({exportProgress}%)
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ZBYTEK STRÁNKY ZŮSTÁVÁ BEZE ZMĚN */}

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

              {(() => {
                const style = getTestTypeStyle(activeTestCase.type);
                return (
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded border mb-3 ${style.color}`}
                  >
                    {style.icon} {style.label}
                  </span>
                );
              })()}

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
                  disabled={blockSingleExport}
                  onClick={() => handleExportSingleTestCase(activeTestCase)}
                  className={`px-4 py-2 rounded-lg ${
                    blockSingleExport
                      ? "bg-slate-700 cursor-not-allowed"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  <FaJira className="inline mr-2" />
                  Exportovat test case do JIRA
                </button>
              </div>

              {/* ADDITIONAL TEST CASES */}
              <div className="mt-6">
                <h4 className="flex items-center gap-2 text-sm mb-3">
                  <FaChevronDown /> Další testovací případy (
                  {scenario.additionalTestCases.length})
                </h4>

                <div className="space-y-2">
                  {scenario.additionalTestCases.map((tc: any) => {
                    const style = getTestTypeStyle(tc.type);

                    return (
                      <button
                        key={tc.id}
                        onClick={() => setActiveTestCase(tc)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          activeTestCase.id === tc.id
                            ? "border-indigo-500 bg-slate-800 shadow-md shadow-indigo-500/20"
                            : "border-slate-800 bg-slate-950 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-4 flex items-center justify-center">
                              {style.icon}
                            </span>
                            <span className="text-sm">{tc.title}</span>
                          </div>

                          <span
                            className={`text-[10px] px-2 py-0.5 rounded border ${style.color}`}
                          >
                            {style.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
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

      {/* STYLES */}
      <style>{`
        .neon-wrap {
          position: relative;
          border-radius: 14px;
          padding: 2px;
          background: linear-gradient(120deg, #4f46e5, #22d3ee, #a855f7);
        }

        .neon-wrap::before {
          content: "";
          position: absolute;
          inset: -14px;
          background: linear-gradient(120deg, #4f46e5, #22d3ee, #a855f7);
          filter: blur(36px);
          opacity: 0.5;
          z-index: -1;
          border-radius: 20px;
        }

        .neon-input {
          width: 100%;
          background: rgba(2, 6, 23, 0.95);
          border: none;
          border-radius: 12px;
          padding: 16px;
          color: #e5e7eb;
          resize: none;
          outline: none;
        }

        .neon-input::placeholder {
          color: #64748b;
        }

        .neon-input:focus {
          box-shadow: 0 0 14px rgba(99,102,241,0.8);
        }

        .neon-button {
          position: relative;
          padding: 12px 28px;
          border-radius: 999px;
          background: linear-gradient(120deg, #4f46e5, #22d3ee, #a855f7);
          color: white;
          font-weight: 500;
          letter-spacing: 0.03em;
          overflow: hidden;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .neon-button::before {
          content: "";
          position: absolute;
          inset: -10px;
          background: linear-gradient(120deg, #4f46e5, #22d3ee, #a855f7);
          filter: blur(28px);
          opacity: 0.7;
          z-index: -1;
        }

        .neon-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 30px rgba(99,102,241,0.8);
        }

        .neon-button:active {
          transform: scale(0.97);
        }

        .neon-pulse {
          animation: neonPulse 2.8s ease-in-out infinite;
        }

        @keyframes neonPulse {
          0% {
            box-shadow: 0 0 14px rgba(99,102,241,0.6),
                        0 0 30px rgba(34,211,238,0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 26px rgba(99,102,241,0.9),
                        0 0 60px rgba(168,85,247,0.6);
            transform: scale(1.03);
          }
          100% {
            box-shadow: 0 0 14px rgba(99,102,241,0.6),
                        0 0 30px rgba(34,211,238,0.4);
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
