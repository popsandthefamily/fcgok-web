"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formState, setFormState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setFormState("sending");

    try {
      const response = await fetch("https://formspree.io/f/xnjgkbrq", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        setFormState("sent");
        form.reset();
      } else {
        setFormState("error");
      }
    } catch {
      setFormState("error");
    }
  }

  if (formState === "sent") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gold/20 bg-gold/5 p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
          <svg className="h-8 w-8 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold">Thanks for reaching out!</h3>
        <p className="mt-2 text-white/50">
          We&apos;ll get back to you soon — usually within a day or two.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-white/70">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/70">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="interest" className="mb-1.5 block text-sm font-medium text-white/70">
          What are you interested in?
        </label>
        <select
          id="interest"
          name="interest"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
        >
          <option value="consulting" className="bg-navy">Small Business Consulting</option>
          <option value="software" className="bg-navy">Travel &amp; Hospitality Software</option>
          <option value="marketing" className="bg-navy">Marketing &amp; SEO</option>
          <option value="branding" className="bg-navy">Branding &amp; Design</option>
          <option value="property" className="bg-navy">Property Management</option>
          <option value="photography" className="bg-navy">Photography</option>
          <option value="other" className="bg-navy">Something Else</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-white/70">
          Tell us a bit about your project
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
          placeholder="What's on your mind? A new website? Help with marketing? Just want to chat about your business? We're all ears."
        />
      </div>

      {formState === "error" && (
        <p className="text-sm text-red-400">
          Something went wrong. You can also email us directly at{" "}
          <a href="mailto:info@fcgok.com" className="underline">info@fcgok.com</a>.
        </p>
      )}

      <button
        type="submit"
        disabled={formState === "sending"}
        className="group inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-sm font-semibold text-navy transition hover:bg-gold-light disabled:opacity-50"
      >
        {formState === "sending" ? "Sending..." : "Send Message"}
        <svg
          className="h-4 w-4 transition group-hover:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
          />
        </svg>
      </button>
    </form>
  );
}
