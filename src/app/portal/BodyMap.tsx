"use client";

import { createContext, useContext, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

type Variant = "unissexo" | "feminino" | "masculino";
type Level = 1 | 2 | 3;
type Entry = { level: Level; photo?: string };

const LEVELS: { level: Level; label: string; color: string }[] = [
  { level: 1, label: "dor leve", color: "var(--pain-1)" },
  { level: 2, label: "dor alta", color: "var(--pain-2)" },
  { level: 3, label: "muita dor", color: "var(--pain-3)" },
];
const levelColor = (l: Level) => LEVELS[l - 1].color;

/** Largura (metade) de ombros, cintura e anca por tipo de manequim. */
const SHAPES: Record<Variant, { s: number; w: number; h: number }> = {
  unissexo: { s: 38, w: 26, h: 30 },
  feminino: { s: 33, w: 21, h: 34 },
  masculino: { s: 43, w: 28, h: 29 },
};

/** Zonas e nível de dor sugerido (o cliente pode alterar ao registar). */
const ZONES: Record<string, { label: string; suggested: Level }> = {
  cabeca: { label: "cabeça", suggested: 3 },
  pescoco: { label: "pescoço", suggested: 3 },
  peito: { label: "peito", suggested: 2 },
  abdomen: { label: "abdómen", suggested: 2 },
  anca: { label: "anca", suggested: 3 },
  "ombro-d": { label: "ombro direito", suggested: 1 },
  "ombro-e": { label: "ombro esquerdo", suggested: 1 },
  "braco-d": { label: "braço direito", suggested: 1 },
  "braco-e": { label: "braço esquerdo", suggested: 1 },
  "antebraco-d": { label: "antebraço direito", suggested: 1 },
  "antebraco-e": { label: "antebraço esquerdo", suggested: 1 },
  "mao-d": { label: "mão direita", suggested: 3 },
  "mao-e": { label: "mão esquerda", suggested: 3 },
  "coxa-d": { label: "coxa direita", suggested: 1 },
  "coxa-e": { label: "coxa esquerda", suggested: 1 },
  "joelho-d": { label: "joelho direito", suggested: 3 },
  "joelho-e": { label: "joelho esquerdo", suggested: 3 },
  "perna-d": { label: "perna direita", suggested: 2 },
  "perna-e": { label: "perna esquerda", suggested: 2 },
  "pe-d": { label: "pé direito", suggested: 3 },
  "pe-e": { label: "pé esquerdo", suggested: 3 },
};

const MapCtx = createContext<{ entries: Record<string, Entry>; active: string | null; open: (id: string) => void }>({
  entries: {},
  active: null,
  open: () => {},
});

/** Uma zona clicável: forma + ponto tracejado quando não tem registo. */
function Zone({ id, cx, cy, children }: { id: string; cx: number; cy: number; children: ReactNode }) {
  const { entries, active, open } = useContext(MapCtx);
  const entry = entries[id];
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open(id);
    }
  };
  return (
    <g
      className={`zone${active === id ? " zone--active" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={`${ZONES[id].label}${entry ? `, registada, ${LEVELS[entry.level - 1].label}` : ", sem registo"}`}
      onClick={() => open(id)}
      onKeyDown={onKey}
      style={entry ? { fill: levelColor(entry.level) } : undefined}
    >
      {children}
      {!entry && <circle className="zone__dot" cx={cx} cy={cy} r="3.5" />}
    </g>
  );
}

export function BodyMap() {
  const [variant, setVariant] = useState<Variant>("unissexo");
  const [entries, setEntries] = useState<Record<string, Entry>>({
    "antebraco-d": { level: 1 },
    "ombro-e": { level: 1 },
    "perna-d": { level: 2 },
  });
  const [active, setActive] = useState<string | null>(null);
  const [draft, setDraft] = useState<Entry>({ level: 1 });
  const [hint, setHint] = useState(false);
  const figureRef = useRef<HTMLDivElement>(null);

  function open(id: string) {
    setActive(id);
    setHint(false);
    setDraft(entries[id] ?? { level: ZONES[id].suggested });
  }
  function save() {
    if (!active) return;
    setEntries({ ...entries, [active]: draft });
    setActive(null);
  }
  function remove() {
    if (!active) return;
    const next = { ...entries };
    delete next[active];
    setEntries(next);
    setActive(null);
  }

  const { s, w, h } = SHAPES[variant];
  const m = (s + w) / 2; // largura a meio do tronco
  const leg = h * 0.56;

  /** Braço e perna são desenhados uma vez e espelhados. `side` = lado da pessoa. */
  function Arm({ side }: { side: "d" | "e" }) {
    const dir = side === "d" ? -1 : 1; // o lado direito da pessoa fica à esquerda no ecrã
    const x = 100 + dir * (s + 9);
    return (
      <g transform={`rotate(${-dir * 9} ${x} 82)`}>
        <Zone id={`braco-${side}`} cx={x} cy={124}>
          <rect x={x - 8} y={92} width={16} height={62} rx={8} />
        </Zone>
        <circle className="joint" cx={x} cy={160} r={7} />
        <Zone id={`antebraco-${side}`} cx={x} cy={194}>
          <rect x={x - 7} y={167} width={14} height={56} rx={7} />
        </Zone>
        <circle className="joint" cx={x} cy={228} r={5} />
        <Zone id={`mao-${side}`} cx={x} cy={245}>
          <ellipse cx={x} cy={245} rx={7.5} ry={12} />
        </Zone>
        <Zone id={`ombro-${side}`} cx={x} cy={82}>
          <circle cx={x} cy={82} r={11} />
        </Zone>
      </g>
    );
  }
  function Leg({ side }: { side: "d" | "e" }) {
    const dir = side === "d" ? -1 : 1;
    const x = 100 + dir * leg;
    return (
      <g>
        <circle className="joint" cx={x} cy={224} r={10} />
        <Zone id={`coxa-${side}`} cx={x} cy={272}>
          <rect x={x - 11} y={234} width={22} height={76} rx={11} />
        </Zone>
        <Zone id={`joelho-${side}`} cx={x} cy={320}>
          <circle cx={x} cy={320} r={9.5} />
        </Zone>
        <Zone id={`perna-${side}`} cx={x} cy={364}>
          <rect x={x - 8.5} y={330} width={17} height={68} rx={8.5} />
        </Zone>
        <circle className="joint" cx={x} cy={403} r={6} />
        <Zone id={`pe-${side}`} cx={x + dir * 4} cy={418}>
          <ellipse cx={x + dir * 4} cy={418} rx={11} ry={7} />
        </Zone>
      </g>
    );
  }

  const count = Object.keys(entries).length;

  return (
    <section className="card bodymap" aria-labelledby="bodymap-title">
      <div className="card__head">
        <h2 id="bodymap-title">o teu mapa</h2>
        <span className="pill">{count} {count === 1 ? "registada" : "registadas"}</span>
      </div>

      <div className="segmented" role="group" aria-label="Tipo de manequim">
        {(Object.keys(SHAPES) as Variant[]).map((v) => (
          <button key={v} type="button" aria-pressed={variant === v} onClick={() => setVariant(v)}>
            {v}
          </button>
        ))}
      </div>

      <div className={`bodymap__figure${hint ? " bodymap__figure--hint" : ""}`} ref={figureRef}>
        <MapCtx.Provider value={{ entries, active, open }}>
        <svg viewBox="20 6 160 426" role="group" aria-label="Manequim: toca numa zona para registar uma tatuagem">
          <Zone id="pescoco" cx={100} cy={62}>
            <rect x={92} y={52} width={16} height={22} rx={5} />
          </Zone>
          <Zone id="cabeca" cx={100} cy={32}>
            <circle cx={100} cy={32} r={22} />
          </Zone>
          {Leg({ side: "d" })}
          {Leg({ side: "e" })}
          <Zone id="anca" cx={100} cy={200}>
            <path d={`M${100 - w} 186 H${100 + w} L${100 + h} 214 Q100 226 ${100 - h} 214 Z`} />
          </Zone>
          <Zone id="abdomen" cx={100} cy={158}>
            <path d={`M${100 - m} 136 H${100 + m} L${100 + w} 182 H${100 - w} Z`} />
          </Zone>
          <Zone id="peito" cx={100} cy={102}>
            <path d={`M${100 - s} 74 H${100 + s} L${100 + m} 132 H${100 - m} Z`} />
          </Zone>
          {Arm({ side: "d" })}
          {Arm({ side: "e" })}
        </svg>
        </MapCtx.Provider>
      </div>

      <ul className="legend" aria-label="Níveis de dor">
        {LEVELS.map((l) => (
          <li key={l.level}><i style={{ background: l.color }} />{l.label}</li>
        ))}
        <li><i className="legend__empty" />sem registo</li>
      </ul>

      {active && (
        <div className="editor" role="group" aria-label={`Registo: ${ZONES[active].label}`}>
          <p className="editor__title">{ZONES[active].label}</p>
          <div className="chips" role="radiogroup" aria-label="Nível de dor">
            {LEVELS.map((l) => (
              <button
                key={l.level}
                type="button"
                role="radio"
                aria-checked={draft.level === l.level}
                className="chip"
                style={{ ["--chip" as string]: l.color }}
                onClick={() => setDraft({ ...draft, level: l.level })}
              >
                {l.label}
              </button>
            ))}
          </div>
          <label className="file" htmlFor="bodymap-foto">
            <span className="btn btn--ghost">{draft.photo ? "trocar foto" : "anexar foto"}</span>
            {draft.photo && <img src={draft.photo} alt="" className="editor__thumb" />}
          </label>
          <input
            id="bodymap-foto"
            type="file"
            accept="image/*"
            className="visually-hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setDraft({ ...draft, photo: URL.createObjectURL(f) });
            }}
          />
          <div className="editor__actions">
            <button type="button" className="btn btn--primary" onClick={save}>guardar</button>
            {entries[active] && <button type="button" className="btn btn--ghost" onClick={remove}>remover</button>}
            <button type="button" className="btn btn--ghost" onClick={() => setActive(null)}>cancelar</button>
          </div>
        </div>
      )}

      <ul className="thumbs">
        {Object.entries(entries).map(([id, e]) => (
          <li key={id}>
            <button type="button" className="thumb" style={{ borderColor: levelColor(e.level) }} onClick={() => open(id)}>
              {e.photo ? <img src={e.photo} alt="" /> : <span className="thumb__ph" aria-hidden="true">sem foto</span>}
              <span className="thumb__label">{ZONES[id].label}</span>
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            className="thumb thumb--add"
            aria-label="Adicionar tatuagem"
            onClick={() => {
              setHint(true);
              figureRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            +
          </button>
        </li>
      </ul>
      {hint && <p className="muted" role="status">Toca numa zona do manequim para adicionar.</p>}
    </section>
  );
}
