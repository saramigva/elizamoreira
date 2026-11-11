const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "2026-09-12" -> "12 set" */
export function shortDate(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

/** 12000 -> "€120" */
export function euros(cents: number) {
  return `€${(cents / 100).toLocaleString("pt-PT", { minimumFractionDigits: cents % 100 ? 2 : 0 })}`;
}

export const ticketNumber = (id: number) => `#${String(id).padStart(3, "0")}`;

/** Só aceita caminhos internos, para o redirecionamento depois do login. */
export const safeNext = (next: string | null | undefined, fallback = "/portal") =>
  next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
