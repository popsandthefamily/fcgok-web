"use client";

import { useState } from "react";

export default function InvestorSignup() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.append("_subject", "Investor List Signup");
    data.append("source", "investor_signup");

    setState("sending");

    try {
      const response = await fetch("https://formspree.io/f/xnjgkbrq", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        setState("sent");
        form.reset();
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl border border-copper/20 bg-copper/5 p-8 text-center">
        <p className="font-medium text-copper">
          You&apos;re on the list. I&apos;ll be in touch.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        className="flex-1 rounded-full border border-cream/10 bg-cream/5 px-5 py-3 text-sm text-cream placeholder-cream/30 outline-none transition focus:border-copper/40 focus:ring-1 focus:ring-copper/20"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="rounded-full bg-copper px-6 py-3 text-sm font-semibold text-cream transition hover:bg-copper-light disabled:opacity-50"
      >
        {state === "sending" ? "Joining..." : "Join the List"}
      </button>
      {state === "error" && (
        <p className="text-xs text-red-400 sm:col-span-2">
          Something went wrong — try{" "}
          <a href="mailto:info@fcgok.com" className="underline">emailing me</a> instead.
        </p>
      )}
    </form>
  );
}
