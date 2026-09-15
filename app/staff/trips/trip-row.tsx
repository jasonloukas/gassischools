"use client";

import { useState } from "react";

export type TripPortalRow = {
  access_token: string;
  access_code: string;
  school_name: string | null;
  tender_title: string | null;
  tender_destination: string | null;
};

export function TripRow({ portal }: { portal: TripPortalRow }) {
  const [copied, setCopied] = useState<"link" | "code" | null>(null);
  const [link, setLink] = useState(`/portal/${portal.access_token}`);

  if (typeof window !== "undefined") {
    const full = `${window.location.origin}/portal/${portal.access_token}`;
    if (link !== full) setLink(full);
  }

  async function copy(text: string, which: "link" | "code") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — ignore.
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="font-medium">{portal.school_name ?? "—"}</p>
      <p className="text-sm text-slate-500">
        {portal.tender_title ?? portal.tender_destination ?? "—"}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <code className="rounded bg-slate-100 px-2 py-1">{link}</code>
        <button
          type="button"
          onClick={() => copy(link, "link")}
          className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
        >
          {copied === "link" ? "Αντιγράφηκε!" : "Αντιγραφή link"}
        </button>
        <code className="rounded bg-slate-100 px-2 py-1">{portal.access_code}</code>
        <button
          type="button"
          onClick={() => copy(portal.access_code, "code")}
          className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
        >
          {copied === "code" ? "Αντιγράφηκε!" : "Αντιγραφή κωδικού"}
        </button>
      </div>
    </div>
  );
}
