import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ACCESS_PASSWORD = "pitwall2026";

export default function LockScreen() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  function submit() {
    if (pw === ACCESS_PASSWORD) navigate("/app/home");
    else setErr("Wrong password");
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl bg-pitCard p-6 border border-white/10">
        <div className="text-center space-y-2 mb-6">
          <div className="text-xs tracking-widest text-white/60">PITWALL AI</div>
          <div className="text-2xl font-bold">Access Required</div>
        </div>

        <input
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          type="password"
          placeholder="Enter password"
          className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-pitRed"
        />

        {err && <div className="mt-3 text-sm text-red-400">{err}</div>}

        <button
          onClick={submit}
          className="mt-5 w-full rounded-xl bg-pitRed py-3 font-semibold"
        >
          Enter
        </button>
      </div>
    </div>
  );
}
