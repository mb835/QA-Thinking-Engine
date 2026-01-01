import {
  FaLightbulb,
  FaBrain,
  FaBullseye,
  FaExclamationTriangle,
  FaRobot,
} from "react-icons/fa";

type Props = {
  insight: {
    reasoning: string;
    coverage: string[];
    risks: string[];
    automationTips: string[];
  };
};

export default function ExpertQAInsightPanel({ insight }: Props) {
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 h-full">
      <h3 className="font-semibold flex items-center gap-2 mb-4 text-lg">
        <FaLightbulb className="text-yellow-400" />
        Expert QA Insight
      </h3>

      {/* REASONING */}
      <div className="mb-5">
        <h4 className="flex items-center gap-2 font-semibold mb-1">
          <FaBrain className="text-indigo-400" />
          Proč je tento test klíčový
        </h4>
        <p className="text-sm text-slate-300">{insight.reasoning}</p>
      </div>

      {/* COVERAGE */}
      <div className="mb-5">
        <h4 className="flex items-center gap-2 font-semibold mb-1">
          <FaBullseye className="text-emerald-400" />
          Coverage
        </h4>
        <ul className="list-disc list-inside text-sm text-slate-300">
          {insight.coverage.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>

      {/* RISKS */}
      <div className="mb-5">
        <h4 className="flex items-center gap-2 font-semibold mb-1">
          <FaExclamationTriangle className="text-orange-400" />
          Rizika
        </h4>
        <ul className="list-disc list-inside text-sm text-slate-300">
          {insight.risks.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      {/* AUTOMATION */}
      <div>
        <h4 className="flex items-center gap-2 font-semibold mb-1">
          <FaRobot className="text-cyan-400" />
          Automation tips
        </h4>
        <ul className="list-disc list-inside text-sm text-slate-300">
          {insight.automationTips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
