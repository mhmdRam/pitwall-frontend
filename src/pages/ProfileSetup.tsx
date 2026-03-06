import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function setProfileName(name: string) {
  localStorage.setItem("pitwall_profile_name", name);
}

export default function ProfileSetup() {
  const nav = useNavigate();
  const [name, setName] = useState("");

  const canContinue = useMemo(() => name.trim().length >= 2, [name]);

  function submit() {
    const clean = name.trim();
    if (clean.length < 2) return;
    setProfileName(clean);
    nav("/app/home");
  }

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center">
      <div className="w-[520px] max-w-[92vw] rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl">
        <div className="text-xs tracking-widest text-white/60 text-center">PITWALL AI</div>
        <h1 className="mt-2 text-2xl font-semibold text-white text-center">Create your profile</h1>
        <p className="mt-2 text-sm text-white/60 text-center">
          This name will appear on the Fan Leaderboard.
        </p>

        <div className="mt-5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-white/20"
            onKeyDown={(e) => {
              if (e.key === "Enter" && canContinue) submit();
            }}
          />
        </div>

        <button
          onClick={submit}
          disabled={!canContinue}
          className="mt-4 w-full rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-white/10 disabled:text-white/40 px-4 py-3 font-semibold text-white transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
