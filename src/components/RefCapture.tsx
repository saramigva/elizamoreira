"use client";

import { useEffect } from "react";

/** Guarda o código de referência (?ref=XXXX) para o associar à conta no registo. */
export function RefCapture() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (!ref) return;
    try {
      localStorage.setItem("ref", ref.slice(0, 12));
    } catch {}
  }, []);
  return null;
}
