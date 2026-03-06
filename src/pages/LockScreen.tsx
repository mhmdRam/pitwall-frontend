import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";


const ACCESS_PASSWORD = import.meta.env.VITE_ACCESS_PASSWORD || "pitwall";

function getProfileName() {
  try {
    return localStorage.getItem("pitwall_profile_name") || "";
  } catch {
    return "";
  }
}

export default function LockScreen() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const canSubmit = useMemo(() => pw.trim().length > 0, [pw]);

  function submit() {
    setErr("");

    if (pw === ACCESS_PASSWORD) {
      const name = getProfileName();
      navigate(name ? "/app/home" : "/profile-setup");
      return;
    }

    setErr("Wrong password");
  }

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center">
      <div className="w-[420px] max-w-[92vw] rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl">
        <div className="text-xs tracking-widest text-white/60 text-center">PITWALL AI</div>
        <h1 className="mt-2 text-2xl font-semibold text-white text-center">Access Required</h1>

        <div className="mt-5">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Enter password"
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-white/20"
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSubmit) submit();
            }}
          />
          {err ? <div className="mt-2 text-sm text-red-400">{err}</div> : null}
        </div>

        <button
          onClick={submit}
          disabled={!canSubmit}
          className="mt-4 w-full rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-white/10 disabled:text-white/40 px-4 py-3 font-semibold text-white transition"
        >
          Enter
        </button>
      </div>
    </div>
  );
}
