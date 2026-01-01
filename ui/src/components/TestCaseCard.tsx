import {
  FaChevronDown,
  FaChevronRight,
  FaRobot,
  FaLightbulb,
  FaShieldAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useState } from "react";

type Props = {
  testCase: any;
  onGeneratePlaywright: (tc: any) => void;
};

export default function TestCaseCard({ testCase, onGeneratePlaywright }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between"
      >
        <div className="font-semibold text-left">
          {testCase.type} – {testCase.title}
        </div>
        {open ? <FaChevronDown /> : <FaChevronRight />}
      </button>

      <p className="text-sm text-slate-400 mt-1">{testCase.description}</p>

      {open && (
        <div className="mt-4 space-y-4">
          {/* STEPS */}
          <ol className="list-decimal list-inside text-sm text-slate-300 space-y-1">
            {testCase.steps?.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ol>

          <p className="text-sm text-slate-400">
            <strong>Očekávaný výsledek:</strong> {testCase.expectedResult}
          </p>

          {/* PLAYWRIGHT */}
          <button
            onClick={() => onGeneratePlaywright(testCase)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700"
          >
            <FaRobot />
            Generate Playwright
          </button>

          {/* EXPERT QA INSIGHT */}
          {testCase.qaInsight && (
            <div className="border-t border-slate-800 pt-4">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <FaLightbulb className="text-yellow-400" />
                Expert QA Insight
              </h4>

              <p className="text-sm text-slate-300 mb-3">
                {testCase.qaInsight.reasoning}
              </p>

              <ul className="list-disc list-inside text-sm text-green-400 mb-3">
                {testCase.qaInsight.coverage.map((c: string, i: number) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>

              <ul className="list-disc list-inside text-sm text-slate-300">
                {testCase.qaInsight.risks.map((r: string, i: number) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
