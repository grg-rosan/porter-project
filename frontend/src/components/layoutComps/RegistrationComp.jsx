import { useState } from "react";

const STEPS = [
  { icon: "person",         label: "Basic info",      sub: null },
  { icon: "directions_car", label: "Vehicle Info",     sub: null },
  { icon: "badge",          label: "National ID card", sub: null },
  { icon: "card_giftcard",  label: "Referral code",    sub: "If you have a referral code" },
];

const Icon = ({ name, className = "" }) => (
  <span className={`material-symbols-rounded ${className}`}>{name}</span>
);

export default function RegistrationComp() {
  const [completed, setCompleted] = useState(new Set([3]));

  const toggle = (i) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const allDone = completed.size === STEPS.length;
  const pct = Math.round((completed.size / STEPS.length) * 100);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />

      <div className="min-h-screen bg-[#f0ede8] flex items-center justify-center p-10">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-[#f0ede8]">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Registration</h1>
            <button className="text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition">
              Close ✕
            </button>
          </div>

          {/* Progress */}
          <div className="px-8 pt-4 pb-2 bg-white">
            <div className="flex justify-between text-xs text-gray-400 font-medium mb-2">
              <span>{completed.size} of {STEPS.length} steps completed</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1 bg-[#f0ede8] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5a8a5a] rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <ul>
            {STEPS.map((step, i) => {
              const done = completed.has(i);
              return (
                <li key={step.label} className="border-b border-[#f0ede8] last:border-none">
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-center gap-4 px-8 py-5 text-left hover:bg-[#fafaf8] transition-colors group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition ${done ? "bg-[#eaf3ea]" : "bg-[#f5f2ed]"}`}>
                      <Icon name={step.icon} className="text-[20px] text-[#5a8a5a]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{step.label}</p>
                      {step.sub && <p className="text-xs text-gray-400 mt-0.5">{step.sub}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {done && <Icon name="check_circle" className="text-[20px] text-[#5a8a5a]" />}
                      <Icon name="chevron_right" className="text-[20px] text-[#5a8a5a] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Footer */}
          <div className="px-8 py-6 bg-[#fafaf8] border-t border-[#f0ede8]">
            <button
              disabled={!allDone}
              className={`w-full py-4 rounded-xl text-sm font-semibold transition-all ${
                allDone
                  ? "bg-[#5a8a5a] text-white shadow-md hover:bg-[#4a7a4a] hover:-translate-y-0.5"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Done
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
              By tapping «Submit» you agree with our{" "}
              <a href="#" className="text-[#5a8a5a] font-medium hover:underline">Terms and Conditions</a>{" "}
              and{" "}
              <a href="#" className="text-[#5a8a5a] font-medium hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}