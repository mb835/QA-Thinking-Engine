import { useState } from "react";

export default function ScenarioPanel() {
  const [expert, setExpert] = useState(false);

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
      <h3 className="text-xl font-semibold mb-4">Test Scenario Generation</h3>

      <input
        className="w-full mb-4 px-4 py-2 rounded bg-slate-800 text-white"
        placeholder="Uživatel provede první nákup na e-shopu"
      />

      <div className="flex items-center gap-4 mb-6">
        <button className="bg-primary px-4 py-2 rounded">
          Generovat scénář
        </button>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={expert}
            onChange={(e) => setExpert(e.target.checked)}
          />
          Advanced / Expert režim
        </label>
      </div>

      {/* TEST CASE */}
      <div className="bg-slate-800 rounded-xl p-4">
        <h4 className="font-semibold mb-2">
          První nákup jako nový zákazník <span className="text-xs text-slate-400">TC_001</span>
        </h4>

        <p className="text-slate-300 mb-4">
          Ověření procesu prvního nákupu na e-shopu pro nového zákazníka.
        </p>

        <h5 className="font-semibold mb-1">Kroky testu</h5>
        <ol className="list-decimal ml-5 text-slate-300">
          <li>Otevřít domovskou stránku e-shopu</li>
          <li>Vybrat produkt a přidat do košíku</li>
          <li>Dokončit objednávku</li>
        </ol>

        <p className="mt-3 text-green-400">
          ✔ Očekávaný výsledek: Objednávka byla úspěšně vytvořena
        </p>

        {/* EXPERT SEKCE */}
        {expert && (
          <div className="mt-6 border-t border-slate-700 pt-4 space-y-3">
            <div>
              <h6 className="font-semibold">🧠 AI Reasoning</h6>
              <p className="text-slate-400">
                Tento scénář pokrývá kritickou cestu nákupu nového zákazníka.
              </p>
            </div>

            <div>
              <h6 className="font-semibold">🎯 Coverage</h6>
              <p className="text-slate-400">
                Pokryto: registrace, košík, checkout<br />
                Nepokryto: refundace, storno
              </p>
            </div>

            <div>
              <h6 className="font-semibold">⚠️ Rizika</h6>
              <p className="text-slate-400">
                Chyby v platební bráně, validace formulářů
              </p>
            </div>

            <div>
              <h6 className="font-semibold">🤖 Automatizace</h6>
              <p className="text-slate-400">
                Vhodné pro Playwright end-to-end test
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
