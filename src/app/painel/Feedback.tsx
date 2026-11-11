"use client";

import { useState } from "react";
import { demoFeedback } from "@/data/demo";

type Source = keyof typeof demoFeedback;

export function Feedback() {
  const [source, setSource] = useState<Source>("site");
  return (
    <section className="card" aria-labelledby="fb-title">
      <div className="card__head">
        <h2 id="fb-title">feedback recebido</h2>
      </div>
      <div className="segmented" role="group" aria-label="Origem do feedback">
        {(["site", "google"] as Source[]).map((s) => (
          <button key={s} type="button" aria-pressed={source === s} onClick={() => setSource(s)}>
            {s === "site" ? "site" : "Google"} ({demoFeedback[s].length})
          </button>
        ))}
      </div>
      <ul className="reviews">
        {demoFeedback[source].map((r, i) => (
          <li key={i}>
            <p className="stars" aria-label={`${r.stars} em 5 estrelas`}>{"★".repeat(r.stars)}<span>{"★".repeat(5 - r.stars)}</span></p>
            <p>{r.text}</p>
            <p className="muted">{r.author}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
