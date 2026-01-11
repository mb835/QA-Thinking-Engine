import { useEffect, useState } from "react";

type Phase = {
  label: string;
  hint: string;
  targetProgress: number;
  color: string;
};

const PHASES: Phase[] = [
  {
    label: "Analyzuji testovací záměr",
    hint: "Vyhodnocení vstupního požadavku",
    targetProgress: 20,
    color: "#38bdf8",
  },
  {
    label: "Identifikuji kritické aplikační toky",
    hint: "Detekce klíčových procesů",
    targetProgress: 40,
    color: "#818cf8",
  },
  {
    label: "Navrhuji akceptační testy",
    hint: "Modelování hlavních průchodů",
    targetProgress: 60,
    color: "#a78bfa",
  },
  {
    label: "Mapuji rizika a odchylky",
    hint: "Analýza chybových stavů",
    targetProgress: 80,
    color: "#fb923c",
  },
  {
    label: "Finalizuji QA expertní analýzu",
    hint: "Kontrola kvality návrhu testů",
    targetProgress: 100,
    color: "#4ade80",
  },
];

export default function LoadingOverlay() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [caret, setCaret] = useState(true);

  const phase = PHASES[phaseIndex];

  /* CARET */
  useEffect(() => {
    const i = setInterval(() => setCaret((c) => !c), 500);
    return () => clearInterval(i);
  }, []);

  /* PROGRESS */
  useEffect(() => {
    const i = setInterval(() => {
      setProgress((p) => {
        if (p >= phase.targetProgress) {
          if (phaseIndex < PHASES.length - 1) {
            setPhaseIndex((i) => i + 1);
          }
          return p;
        }

        const step = p < 30 ? 1.2 : p < 60 ? 0.7 : p < 85 ? 0.4 : 0.2;
        return Math.min(p + step, phase.targetProgress);
      });
    }, 40);

    return () => clearInterval(i);
  }, [phaseIndex, phase]);

  const spinSpeed = 2 - progress / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md">
      <div className="flex flex-col items-center gap-10 relative z-10">

        {/* ===== WORM LOADER ===== */}
        <div className="loader-wrap">
          <svg
            viewBox="0 0 120 120"
            className="loader-svg"
            style={{ animationDuration: `${spinSpeed}s` }}
          >
            <defs>
              <linearGradient
                id="wormGradient"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="120"
                y2="0"
              >
                <stop offset="0%" stopColor={phase.color} />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor={phase.color} />
              </linearGradient>
            </defs>

            <circle cx="60" cy="60" r="46" className="loader-track" />
            <circle cx="60" cy="60" r="46" className="loader-ghost" />
            <circle cx="60" cy="60" r="46" className="loader-worm" />
          </svg>

          <div
            className="loader-glow"
            style={{ background: `radial-gradient(circle, ${phase.color}66, transparent 65%)` }}
          />
        </div>

        {/* ===== TEXT ===== */}
        <div className="text-center max-w-sm space-y-2">
          <div className="text-xs uppercase tracking-[0.35em] text-indigo-400">
            ZPRACOVÁNÍ POMOCÍ UMĚLÉ INTELIGENCE
          </div>

          <div className="text-sm text-slate-200 glitch">
            {phase.label}
            <span className="inline-block w-2">{caret ? "▍" : ""}</span>
          </div>

          <div className="text-xs text-slate-500">
            {phase.hint}
          </div>

          {/* ===== PROGRESS BAR (CENTERED) ===== */}
          <div className="mt-4 flex flex-col items-center">
            <div className="h-1.5 w-64 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${progress}%`, background: phase.color }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {Math.round(progress)} %
            </div>
          </div>
        </div>
      </div>

      {/* ================= STYLES ================= */}
      <style>{`
        /* LOADER */
        .loader-wrap {
          position: relative;
          width: 160px;
          height: 160px;
        }

        .loader-svg {
          width: 160px;
          height: 160px;
          animation: spin linear infinite;
        }

        .loader-track {
          fill: none;
          stroke: rgba(255,255,255,0.08);
          stroke-width: 8;
        }

        .loader-worm {
          fill: none;
          stroke: url(#wormGradient);
          stroke-width: 8;
          stroke-linecap: round;
          stroke-dasharray: 120 170;
          animation: dashMove 1.1s ease-in-out infinite;
          filter: drop-shadow(0 0 14px rgba(120,120,255,0.9));
        }

        .loader-ghost {
          fill: none;
          stroke: rgba(255,255,255,0.15);
          stroke-width: 8;
          stroke-linecap: round;
          stroke-dasharray: 60 230;
          animation: dashGhost 1.6s ease-in-out infinite;
        }

        .loader-glow {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          filter: blur(28px);
          animation: glowPulse 3s ease-in-out infinite;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        @keyframes dashMove {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -280; }
        }

        @keyframes dashGhost {
          0% { stroke-dashoffset: -200; }
          100% { stroke-dashoffset: -480; }
        }

        @keyframes glowPulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.9; }
          100% { opacity: 0.3; }
        }

        /* GLITCH TEXT */
        .glitch {
          position: relative;
          animation: glitch 2.5s infinite;
        }

        @keyframes glitch {
          0% { text-shadow: none; }
          20% { text-shadow: 1px 0 red, -1px 0 cyan; }
          40% { text-shadow: none; }
          60% { text-shadow: -1px 0 red, 1px 0 cyan; }
          80% { text-shadow: none; }
          100% { text-shadow: none; }
        }
      `}</style>
    </div>
  );
}
