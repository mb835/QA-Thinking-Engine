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
    color: "#38bdf8", // Sky Blue
  },
  {
    label: "Identifikuji kritické aplikační toky",
    hint: "Detekce klíčových procesů",
    targetProgress: 40,
    color: "#818cf8", // Indigo
  },
  {
    label: "Navrhuji akceptační test",
    hint: "Modelování hlavních průchodů",
    targetProgress: 60,
    color: "#a78bfa", // Violet
  },
  {
    label: "Mapuji rizika a odchylky",
    hint: "Analýza chybových stavů",
    targetProgress: 80,
    color: "#fb923c", // Orange
  },
  {
    label: "Finalizuji QA expertní analýzu",
    hint: "Kontrola kvality návrhu testů",
    targetProgress: 100,
    color: "#4ade80", // Green
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

  /* PROGRESS LOGIC (Zachována původní) */
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

  // Rychlost rotace podle progressu
  const spinSpeed = 2.5 - progress / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md">
      <div className="flex flex-col items-center gap-8 relative z-10">

        {/* ===== REACTOR SPINNER (Iron Man Style) ===== */}
        <div className="loader-wrap">
          <svg
            viewBox="0 0 200 200"
            className="loader-svg"
            style={{ '--spin-duration': `${spinSpeed}s` } as React.CSSProperties}
          >
            <defs>
              {/* Gradient pro hlavní prstenec */}
              <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={phase.color} stopOpacity="0" />
                <stop offset="50%" stopColor={phase.color} stopOpacity="0.5" />
                <stop offset="100%" stopColor="white" />
              </linearGradient>
              
              {/* Glow Filter */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 1. LAYER: Static Decorative Ring (Very Faint) */}
            <circle cx="100" cy="100" r="90" fill="none" stroke={phase.color} strokeWidth="1" opacity="0.1" strokeDasharray="2 4" />

            {/* 2. LAYER: Outer Tick Marks (Slow Rotate) */}
            <g className="spin-slow-reverse origin-center opacity-40">
               <circle cx="100" cy="100" r="82" fill="none" stroke={phase.color} strokeWidth="1" strokeDasharray="1 10" strokeLinecap="round" />
            </g>

            {/* 3. LAYER: Middle Segmented Ring (Medium Rotate) */}
            <g className="spin-medium origin-center">
               <circle cx="100" cy="100" r="68" fill="none" stroke={phase.color} strokeWidth="2" strokeDasharray="40 100" opacity="0.6" />
            </g>

            {/* 4. LAYER: Inner Fast Track (The "Worm") */}
            <g className="spin-fast origin-center" filter="url(#glow)">
               {/* Background track */}
               <circle cx="100" cy="100" r="50" fill="none" stroke={phase.color} strokeWidth="2" opacity="0.1" />
               {/* Active worm */}
               <circle cx="100" cy="100" r="50" fill="none" stroke="url(#arcGradient)" strokeWidth="4" strokeDasharray="100 220" strokeLinecap="round" />
            </g>

            {/* 5. LAYER: Core (Pulsing) */}
            <g className="pulse-core origin-center">
              <circle cx="100" cy="100" r="25" fill={phase.color} opacity="0.15" />
              <circle cx="100" cy="100" r="15" fill={phase.color} opacity="0.4" />
              <circle cx="100" cy="100" r="6" fill="white" opacity="0.8" />
            </g>
          </svg>
        </div>

        {/* ===== TEXT SECTION ===== */}
        <div className="text-center max-w-lg space-y-3">
          
          {/* Nadpis */}
          <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-semibold mb-1">
            QA THINKING ENGINE
          </div>

          {/* Hlavní Fáze (Glitch efekt) */}
          <h2 className="text-lg md:text-xl text-white font-mono font-bold tracking-wide" style={{ textShadow: `0 0 15px ${phase.color}80` }}>
            {phase.label}
            <span className="inline-block w-2 ml-1 animate-pulse text-slate-400">{caret ? "█" : ""}</span>
          </h2>

          {/* Hint pod textem */}
          <div className="text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
             <span className="text-slate-600">{">"}</span>
             {phase.hint}
          </div>

          {/* Jednoduchý Progress Bar (bez textu pod ním) */}
          <div className="mt-4 w-64 h-1 bg-slate-900 rounded-full overflow-hidden mx-auto relative">
             <div 
               className="h-full absolute top-0 left-0 transition-all duration-200"
               style={{ 
                 width: `${progress}%`, 
                 background: phase.color,
                 boxShadow: `0 0 10px ${phase.color}`
               }}
             />
          </div>
          
        </div>
      </div>

      {/* ================= STYLES ================= */}
      <style>{`
        .loader-wrap {
          width: 180px;
          height: 180px;
          position: relative;
        }
        .loader-svg {
          width: 100%;
          height: 100%;
        }
        .origin-center { transform-origin: center; }

        /* Animations */
        .spin-slow-reverse { animation: spinReverse 20s linear infinite; }
        .spin-medium { animation: spin 8s linear infinite; }
        .spin-fast { animation: spin var(--spin-duration, 2s) linear infinite; }
        .pulse-core { animation: pulse 2s ease-in-out infinite; }

        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes spinReverse { 100% { transform: rotate(-360deg); } }
        
        @keyframes pulse {
          0%, 100% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}