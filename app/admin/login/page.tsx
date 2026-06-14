"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) {
      router.replace("/admin");
      router.refresh();
    } else {
      setError("Wrong password. Try again.");
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-5">
      <form onSubmit={submit} className="w-full max-w-sm border border-white/15 bg-white/5 p-8">
        {/* Logo sits at the top-center of the box; ADMIN continues right after
            "PARTS" (which ends at 86.3% of the logo width) and is baseline-aligned
            to the AUTO SPARE PARTS line at the bottom of the logo. */}
        <div className="relative mx-auto w-[150px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sparezy-logo-white.png"
            alt="Sparezy Auto Spare Parts"
            className="block w-full select-none"
            draggable={false}
          />
          <span
            className="absolute font-bold uppercase text-white/60"
            style={{
              left: "86.3%",
              bottom: "-0.2em",
              marginLeft: "0.4rem",
              lineHeight: 1,
              fontSize: "0.82rem",
              letterSpacing: "0.2em",
              whiteSpace: "nowrap",
            }}
          >
            Admin
          </span>
        </div>

        <label className="mt-8 block">
          <span className="field-label">Password</span>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
            placeholder="••••••••"
          />
        </label>

        {error && <p className="mt-3 text-[0.8rem] font-semibold text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full bg-green py-3 text-sm font-bold uppercase tracking-wider2 text-white transition-colors hover:bg-green/90 disabled:opacity-60"
        >
          {busy ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}
