/**
 * Símbolo da marca: sol com olho central (primeira versão).
 *
 * A Eliza vai desenhar o símbolo definitivo. Para o trocar, basta substituir
 * o SVG deste ficheiro: navbar, hero, selos e ecrãs internos usam todos este
 * componente. O favicon está em src/app/icon.svg.
 */

type SmallProps = {
  size?: number;
  /** default = símbolo normal; earned = selo ganho; pending = selo por ganhar */
  state?: "default" | "earned" | "pending";
  className?: string;
  title?: string;
};

const RAYS = [
  [30, 5, 30, 13], [30, 47, 30, 55], [5, 30, 13, 30], [47, 30, 55, 30],
  [12, 12, 18, 18], [42, 42, 48, 48], [48, 12, 42, 18], [18, 42, 12, 48],
];

export function SunSymbol({ size = 28, state = "default", className, title }: SmallProps) {
  const pending = state === "pending";
  const earned = state === "earned";
  const rayColor = pending ? "var(--border)" : "var(--accent)";
  return (
    <svg
      viewBox="0 0 60 60"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <circle
        cx="30" cy="30" r="9"
        fill={earned ? "var(--accent)" : "none"}
        stroke={pending ? "var(--border)" : earned ? "var(--accent)" : "var(--text)"}
        strokeWidth="1.5"
        strokeDasharray={pending ? "3 2.5" : undefined}
      />
      {!pending && <circle cx="30" cy="30" r="3" fill={earned ? "var(--bg)" : "var(--accent)"} />}
      <g stroke={rayColor} strokeWidth={earned ? 2.2 : 1.5} strokeLinecap="round" strokeDasharray={pending ? "2.5 2.5" : undefined}>
        {RAYS.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
    </svg>
  );
}

/** Versão grande, com raios ondulados (hero). */
export function SunSymbolLarge({ className }: { className?: string }) {
  return (
    <svg viewBox="185 40 310 330" className={className} aria-hidden="true">
      <path
        className="sun-rays"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        d="M340 50 Q334 82 340 108 Q346 82 340 50 M398 66 Q380 92 377 118 Q401 100 398 66 M444 102 Q416 121 403 144 Q429 137 444 102 M474 154 Q441 160 420 174 Q445 186 474 154 M485 205 Q452 205 428 205 Q452 205 485 205 M474 256 Q441 250 420 236 Q445 224 474 256 M444 308 Q416 289 403 266 Q429 273 444 308 M398 344 Q380 318 377 292 Q401 310 398 344 M340 360 Q334 328 340 302 Q346 328 340 360 M282 344 Q300 318 303 292 Q279 310 282 344 M236 308 Q264 289 277 266 Q251 273 236 308 M206 256 Q239 250 260 236 Q235 224 206 256 M195 205 Q228 205 252 205 Q228 205 195 205 M206 154 Q239 160 260 174 Q235 186 206 154 M236 102 Q264 121 277 144 Q251 137 236 102 M282 66 Q300 92 303 118 Q279 100 282 66"
      />
      <path d="M250 205 Q340 158 430 205 Q340 252 250 205 Z" fill="#0f113a" stroke="#F3EFE4" strokeWidth="1.8" />
      <circle cx="340" cy="205" r="24" fill="none" stroke="#F3EFE4" strokeWidth="2" />
      <circle cx="340" cy="205" r="8" fill="#f6a700" />
    </svg>
  );
}
