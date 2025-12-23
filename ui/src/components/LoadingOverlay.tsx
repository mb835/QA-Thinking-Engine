type Props = {
  text?: string;
};

export default function LoadingOverlay({
  text = "Generuji testovací scénář…",
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
      <div className="flex flex-col items-center gap-8">
        {/* AI ORBIT */}
        <div className="relative w-28 h-28">
          {/* CORE */}
          <div className="absolute inset-0 rounded-full ai-core" />

          {/* ORBIT */}
          <div className="absolute inset-0 ai-orbit">
            <div className="ai-dot" />
          </div>
        </div>

        {/* TEXT */}
        <div className="text-center max-w-xs">
          <div className="text-xs uppercase tracking-[0.35em] text-indigo-400 mb-2">
            AI PROCESSING
          </div>

          <div className="text-sm text-slate-200 mb-1">
            {text}
          </div>

          <div className="text-xs text-slate-500">
            Analyzuji záměr → Generuji scénář → Validuji strukturu
          </div>
        </div>
      </div>

      {/* STYLES */}
      <style>{`
        .ai-core {
          background: radial-gradient(circle at 30% 30%, #a78bfa, #6366f1);
          box-shadow: 0 0 120px rgba(139,92,246,0.9);
          animation: corePulse 3s ease-in-out infinite;
        }

        @keyframes corePulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }

        .ai-orbit {
          animation: orbitSpin 4s linear infinite;
        }

        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .ai-dot {
          position: absolute;
          top: -6px;
          left: 50%;
          width: 12px;
          height: 12px;
          transform: translateX(-50%);
          border-radius: 50%;
          background: #a78bfa;
          box-shadow: 0 0 20px rgba(167,139,250,0.9);
        }
      `}</style>
    </div>
  );
}
