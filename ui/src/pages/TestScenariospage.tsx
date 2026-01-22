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
  FaTerminal,
  FaRedo, // Důležité pro tlačítko "Nový test"
  FaArrowRight
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

type JiraIssue = { key: string; url: string };

type ScenarioJiraResult = {
  epic: JiraIssue;
  tasks: { id: string; key: string; url: string }[];
};

// --- HOOK PRO ANIMOVANÝ PLACEHOLDER ---
const useTypewriter = (texts: string[], speed = 30, pause = 1500) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const typeSpeed = isDeleting ? speed / 4 : speed;

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setDisplayedText((prev) => prev.substring(0, prev.length - 1));
        setIsPaused(false);
      } else {
        setDisplayedText((prev) => texts[index].substring(0, subIndex + 1));
      }

      if (!isDeleting && subIndex === texts[index].length) {
        setIsPaused(true);
        setTimeout(() => {
            setIsPaused(false);
            setIsDeleting(true);
        }, pause);
        return;
      }

      if (isDeleting && displayedText === "") {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % texts.length);
        setSubIndex(0);
        return;
      }

      const nextSubIndex = isDeleting ? subIndex - 1 : subIndex + 1;
      setSubIndex(nextSubIndex);

    }, typeSpeed);

    return () => clearTimeout(timeout);
  }, [subIndex, isDeleting, index, texts, speed, pause, displayedText]);

  return { displayedText, currentFullText: texts[index], isPaused };
};

/* =========================
   STYLY TYPŮ TESTŮ
========================= */
function getTestTypeStyle(type: string) {
  switch (type?.toLowerCase()) {
    case "acceptance":
      return { label: "Akceptační", color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/40", icon: "✅" };
    case "negative":
      return { label: "Negativní", color: "text-red-400 bg-red-500/15 border-red-500/40", icon: "⚠" };
    case "edge":
      return { label: "Hraniční", color: "text-amber-400 bg-amber-500/15 border-amber-500/40", icon: "🧪" };
    case "security":
      return { label: "Bezpečnostní", color: "text-purple-400 bg-purple-500/15 border-purple-500/40", icon: "🔒" };
    case "ux":
      return { label: "Uživatelský (UX)", color: "text-sky-400 bg-sky-500/15 border-sky-500/40", icon: "👁" };
    case "data":
      return { label: "Datový", color: "text-indigo-400 bg-indigo-500/15 border-indigo-500/40", icon: "🗄" };
    default:
      return { label: type?.toUpperCase() || "Test", color: "text-slate-400 bg-slate-500/10 border-slate-500/30", icon: "🧩" };
  }
}

export default function TestScenariosPage() {
  
  // --- STATE S PERSISTENCÍ (Načítání z localStorage) ---
  const [intent, setIntent] = useState(() => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("qa_intent") || "";
    }
    return "";
  });

  const [scenario, setScenario] = useState<any>(() => {
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem("qa_scenario");
        return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const [activeTestCase, setActiveTestCase] = useState<any>(() => {
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem("qa_scenario");
        return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  // --- EFEKTY PRO UKLÁDÁNÍ ---
  useEffect(() => {
    localStorage.setItem("qa_intent", intent);
  }, [intent]);

  useEffect(() => {
    if (scenario) {
      localStorage.setItem("qa_scenario", JSON.stringify(scenario));
    } else {
        localStorage.removeItem("qa_scenario");
    }
  }, [scenario]);


  const [loading, setLoading] = useState(false);
  const [loadingStepsId, setLoadingStepsId] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  
  // Stavy pro "Button Feedback"
  const [pwSuccessId, setPwSuccessId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);
  const [jiraSuccessId, setJiraSuccessId] = useState<string | null>(null);

  const [scenarioExportLoading, setScenarioExportLoading] = useState(false);
  const [scenarioJiraResult, setScenarioJiraResult] = useState<ScenarioJiraResult | null>(null);

  const [singleJiraResults, setSingleJiraResults] = useState<Record<string, JiraIssue>>({});

  const [exportJobId, setExportJobId] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<any>(null);

  const { displayedText, currentFullText, isPaused } = useTypewriter([
    "Jako neregistrovaný uživatel vyhledej 'herní notebook', vyfiltruj pouze značku ASUS s cenou nad 30 000 Kč, přidej ho do košíku, v košíku přidej ještě pojištění proti rozbití, uplatni slevový kód 'SLEVA2024' a dokonči objednávku s doručením na pobočku...",
    "Jako uživatel chci mít možnost resetovat heslo pomocí e-mailového odkazu...",
    "Zkontroluj validaci registračního formuláře při zadání neplatných dat (špatný formát e-mailu, krátké heslo)...",
    "Otestuj chování košíku při přidání 999 kusů produktu a následném odebrání...",
    "Ověř, že uživatel s rolí 'Editor' nemá přístup do sekce 'Nastavení uživatelů'...",
    "Otestuj platební bránu: Zamítnutá platba kartou z důvodu nedostatku prostředků...",
    "Ověř funkčnost filtrování produktů podle parametrů (barva, velikost, materiál)..."
  ], 15, 4000); 

  const isScenarioExportRunning = scenarioExportLoading || exportStatus?.status === "running";
  const isScenarioAlreadyExported = !!scenarioJiraResult;
  const blockSingleExport = isScenarioExportRunning || isScenarioAlreadyExported;

  const exportProgress = exportStatus?.total > 0
      ? Math.round((exportStatus.done / exportStatus.total) * 100)
      : 0;

  const hasInsightObject = !!activeTestCase?.qaInsight;
  const isFullInsight = hasInsightObject && 
                        activeTestCase.qaInsight.risks && activeTestCase.qaInsight.risks.length > 0 &&
                        activeTestCase.qaInsight.coverage && activeTestCase.qaInsight.coverage.length > 0;

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
    } finally {
      setLoading(false);
    }
  }

  // --- FUNKCE PRO RESET (NOVÝ TEST) ---
  function handleClearAll() {
    setIntent("");
    setScenario(null);
    setActiveTestCase(null);
    setScenarioJiraResult(null);
    localStorage.removeItem("qa_intent");
    localStorage.removeItem("qa_scenario");
  }

  function handleUseExample() {
    setIntent(currentFullText);
  }

  async function handleGenerateSteps(tc: any) {
    try {
      setLoadingStepsId(tc.id);
      const sourceTc = scenario?.additionalTestCases?.find((t: any) => t.id === tc.id) || tc;
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
    } finally {
      setLoadingStepsId(null);
    }
  }

  async function handleGenerateInsight(tc: any) {
    try {
      setLoadingInsight(true);
      const sourceTc = scenario?.additionalTestCases?.find((t: any) => t.id === tc.id) || tc;
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
    } finally {
      setLoadingInsight(false);
    }
  }

  async function handleRunPlaywright(tc: any) {
    try {
      await runPlaywright(tc); 
      setPwSuccessId(tc.id);
      setTimeout(() => setPwSuccessId(null), 2500); 
    } catch (e) {
      console.error(e);
    }
  }

  function handleDownloadSpec(tc: any) {
    downloadPlaywrightSpec(tc);
    setDownloadSuccessId(tc.id);
    setTimeout(() => setDownloadSuccessId(null), 2000);
  }

  async function handleExportSingleTestCase(tc: any) {
    if (blockSingleExport) return;
    try {
      const sourceTc = scenario?.additionalTestCases?.find((t: any) => t.id === tc.id) || tc;
      const result = await exportToJira(sourceTc);
      setSingleJiraResults((prev) => ({
        ...prev,
        [tc.id]: { key: result.issueKey, url: result.issueUrl },
      }));
      setJiraSuccessId(tc.id);
      setTimeout(() => setJiraSuccessId(null), 3000);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleExportWholeScenario() {
    if (!scenario || isScenarioExportRunning) return;
    try {
      setScenarioExportLoading(true);
      setScenarioJiraResult(null);
      setExportStatus(null);
      const res = await fetch("http://localhost:3000/api/integrations/jira/export-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testCase: scenario }),
      });
      const data = await res.json();
      setExportJobId(data.jobId);
    } catch (e) {
      console.error(e);
      setScenarioExportLoading(false);
    }
  }

  useEffect(() => {
    if (!exportJobId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/integrations/jira/export-status/${exportJobId}`);
        const data = await res.json();
        setExportStatus(data);
        if (data.status === "done") {
          setScenarioJiraResult(data.result || null);
          setScenarioExportLoading(false);
          clearInterval(interval);
        }
        if (data.status === "error") {
          console.error("Export failed");
          setScenarioExportLoading(false);
          clearInterval(interval);
        }
      } catch (err) {
        setScenarioExportLoading(false);
        clearInterval(interval);
      }
    }, 600);
    return () => clearInterval(interval);
  }, [exportJobId]);

  const isAcceptance = activeTestCase?.id === scenario?.id;
  const hasSteps = Array.isArray(activeTestCase?.steps);
  const taskForActive = scenarioJiraResult?.tasks?.find((t) => t.id === activeTestCase?.id) || null;
  const singleExport = singleJiraResults[activeTestCase?.id];

  return (
    <div className="px-8 py-6 relative">
      {loading && <LoadingOverlay />}

      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-wide text-white text-left">
            Testovací scénáře
          </h1>
          <p className="text-sm text-slate-400 text-left">
            Zadej záměr a AI navrhne kompletní test design
          </p>
        </div>

        {/* INPUT */}
        <div>
          {/* Label + Reset Button */}
          <div className="flex justify-between items-end mb-2">
            <label className="block text-sm text-slate-300 text-left">
                Testovací záměr
            </label>
            {(intent || scenario) && (
                <button 
                onClick={handleClearAll}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                <FaRedo className="text-[10px]" /> Nový test (Vyčistit)
                </button>
            )}
          </div>

          <div className="neon-wrap relative group">
            <textarea
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              rows={4}
              placeholder={displayedText}
              className="neon-input"
            />
            {!intent && isPaused && (
                <button 
                    onClick={handleUseExample}
                    className="absolute bottom-4 right-4 bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-sm transition-all animate-fade-in shadow-lg border border-white/10 z-10"
                >
                    Použít tento scénář <FaArrowRight />
                </button>
            )}
          </div>

          <div className="flex justify-between items-start mt-4 gap-4">
            <button
              onClick={handleGenerateScenario}
              className="neon-button neon-pulse"
            >
              <span className="relative z-10">Spustit QA analýzu</span>
            </button>

            {scenario && (
              <div className="flex flex-col items-end gap-2 text-left">
                <button
                  onClick={handleExportWholeScenario}
                  disabled={isScenarioExportRunning}
                  className={`px-5 py-2 rounded-lg text-white ${
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

        {/* RESULTS GRID */}
        {scenario && activeTestCase && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 text-left">
            {/* LEFT */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  {!isAcceptance && (
                    <button
                      onClick={() => setActiveTestCase(scenario)}
                      className="flex items-center gap-2 text-sm text-indigo-400 hover:underline"
                    >
                      <FaArrowLeft /> Zpět na hlavní akceptační test
                    </button>
                  )}
                </div>
                <AiGeneratedBadge />
              </div>

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
                  className="text-sm px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white"
                >
                  <FaMagic className="inline mr-2" />
                  Generuj kroky
                </button>
              )}

              <p className="text-sm mb-4">
                <strong>Očekávaný výsledek:</strong>{" "}
                {activeTestCase.expectedResult}
              </p>

              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  disabled={!hasSteps}
                  onClick={() => handleDownloadSpec(activeTestCase)}
                  className={`px-4 py-2 rounded-lg text-white transition-all ${
                    downloadSuccessId === activeTestCase.id
                      ? "bg-emerald-600 hover:bg-emerald-700 scale-105"
                      : hasSteps
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-slate-700 cursor-not-allowed"
                  }`}
                >
                  {downloadSuccessId === activeTestCase.id ? (
                      <>
                        <FaCheckCircle className="inline mr-2" />
                        Staženo
                      </>
                  ) : (
                      <>
                        <FaDownload className="inline mr-2" />
                        Stáhnout Playwright test
                      </>
                  )}
                </button>

                <button
                  disabled={blockSingleExport}
                  onClick={() => handleExportSingleTestCase(activeTestCase)}
                  className={`px-4 py-2 rounded-lg text-white transition-all ${
                    jiraSuccessId === activeTestCase.id
                      ? "bg-emerald-600 hover:bg-emerald-700 scale-105"
                      : blockSingleExport
                      ? "bg-slate-700 cursor-not-allowed"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {jiraSuccessId === activeTestCase.id ? (
                      <>✅ Exportováno</>
                  ) : (
                      <>
                        <FaJira className="inline mr-2" />
                        Export do JIRA
                      </>
                  )}
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
                            <span className="text-sm text-white">{tc.title}</span>
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

            {/* RIGHT SIDE: EXPERT QA ANALYSIS */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 text-left">
              <h3 className="font-semibold flex items-center gap-2 mb-4 text-white">
                <FaLightbulb className="text-yellow-400" />
                Expertní QA analýza
              </h3>

              {hasInsightObject ? (
                <div className="space-y-6 text-sm text-white">
                  
                  {activeTestCase.qaInsight.reasoning && (
                    <section>
                        <h4 className="flex items-center gap-2 font-semibold mb-1">
                        <FaBullseye className="text-indigo-400" />
                        Proč je test klíčový
                        </h4>
                        <p className="text-slate-300">{activeTestCase.qaInsight.reasoning}</p>
                    </section>
                  )}

                  {activeTestCase.qaInsight.coverage?.length > 0 && (
                    <section>
                        <h4 className="flex items-center gap-2 font-semibold mb-1 text-white">
                        <FaCheckCircle className="text-emerald-400" />
                        Pokrytí
                        </h4>
                        <ul className="list-disc list-inside text-slate-300">
                        {activeTestCase.qaInsight.coverage.map(
                            (c: string, i: number) => (
                            <li key={i}>{c}</li>
                            )
                        )}
                        </ul>
                    </section>
                  )}

                  {/* --- RIZIKA (Clean Native Style - FINÁLNÍ DESIGN) --- */}
                  {activeTestCase.qaInsight.risks?.length > 0 && (
                    <section className="mt-6">
                        <h4 className="flex items-center gap-2 font-semibold mb-2 text-red-400">
                           <FaExclamationTriangle />
                           Rizika
                        </h4>
                        
                        <div className="space-y-2">
                            {activeTestCase.qaInsight.risks.map((r: string, i: number) => (
                            <div key={i} className="flex items-start gap-3">
                                
                                {/* CSS Terč (decentní, bez importu) */}
                                <span className="mt-[5px] flex-shrink-0 flex items-center justify-center h-3 w-3 rounded-full border border-red-500/60">
                                    <span className="h-1 w-1 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.6)]"></span>
                                </span>
                                
                                {/* Text rizika - červený, ale čistý bez pozadí */}
                                <span className="text-sm text-red-200/90 leading-relaxed">
                                   {r.replace("⚠️", "").trim()}
                                </span>
                            </div>
                            ))}
                        </div>
                    </section>
                  )}

                  {activeTestCase.qaInsight.automationTips?.length > 0 && (
                    <section className="mt-6">
                        <h4 className="flex items-center gap-2 font-semibold mb-1 text-white">
                        <FaRobot className="text-indigo-400" />
                        Doporučení pro Playwright
                        </h4>
                        <ul className="list-disc list-inside text-slate-300">
                        {activeTestCase.qaInsight.automationTips.map(
                            (t: string, i: number) => (
                            <li key={i} className="flex gap-2 items-start">
                                <span className="mt-1"><FaTerminal className="text-[10px]" /></span>
                                {t}
                            </li>
                            )
                        )}
                        </ul>
                    </section>
                  )}

                  {!isFullInsight && (
                    <div className="pt-8 mt-4 border-t border-white/5 text-center">
                        <p className="text-[10px] font-bold text-zinc-500 mb-4 uppercase tracking-widest">
                            Chybí detailní analýza rizik a automatizace?
                        </p>
                        <button 
                            onClick={() => handleGenerateInsight(activeTestCase)} 
                            disabled={loadingInsight}
                            className="px-8 py-3 bg-zinc-800 hover:bg-indigo-600 text-white font-bold rounded-full text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-indigo-500/20"
                        >
                            {loadingInsight ? (
                                <span className="flex items-center gap-2 justify-center">
                                    <FaSpinner className="animate-spin" /> Dopočítávám data...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 justify-center">
                                    <FaRedo /> Doplnit kompletní analýzu
                                </span>
                            )}
                        </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                    <p className="text-slate-400 text-sm mb-4">Expertní analýza není pro tento test k dispozici.</p>
                    <button
                    onClick={() => handleGenerateInsight(activeTestCase)}
                    disabled={loadingInsight}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                    {loadingInsight
                        ? "Generuji Expert QA Insight…"
                        : "Generuj Expert QA Insight"}
                    </button>
                </div>
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
        
        @keyframes fade-in {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}