import { useState } from "react";
import { getRouteApi } from "@tanstack/react-router";

const loginRoute = getRouteApi("/login");

export function LoginForm() {
  const search = loginRoute.useSearch();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);
  const [devCode, setDevCode] = useState("");

  const start = async () => {
    setBusy(true);
    setDetail("");
    setDevCode("");
    try {
      const res = await fetch("/api/auth/otp/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = (await res.json().catch(() => null)) as {
        status?: string;
        detail?: string;
        devCode?: string;
      } | null;
      if (res.ok && body?.status === "code_sent") {
        setStep("code");
        if (body.devCode) setDevCode(body.devCode);
        return;
      }
      setDetail(body?.detail || body?.status || "Didn't go through.");
    } catch {
      setDetail("Didn't go through.");
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setDetail("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const body = (await res.json().catch(() => null)) as {
        status?: string;
        detail?: string;
      } | null;
      if (res.ok && body?.status === "authenticated") {
        window.location.assign(search.next);
        return;
      }
      setDetail(body?.detail || body?.status || "Didn't go through.");
    } catch {
      setDetail("Didn't go through.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="grid max-w-sm gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (step === "email") void start();
        else void verify();
      }}
    >
      <label className="grid gap-1.5 text-[13px] text-ink" htmlFor="email">
        Email
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="border border-ink/20 bg-snow px-3 py-2 text-sm text-ink"
        />
      </label>
      {step === "code" && (
        <label className="grid gap-1.5 text-[13px] text-ink" htmlFor="code">
          Code
          <input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            pattern="\d{6}"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="border border-ink/20 bg-snow px-3 py-2 text-sm text-ink"
          />
        </label>
      )}
      {devCode ? <p className="text-[13px] text-graphite">Local code: {devCode}</p> : null}
      {detail ? (
        <p className="text-[13px] text-destructive" role="alert">
          {detail}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="h-9 bg-ink px-3 text-[13px] font-medium text-snow disabled:opacity-50"
      >
        {busy ? "Sending…" : step === "email" ? "Email me a code" : "Sign in"}
      </button>
    </form>
  );
}
