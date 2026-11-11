import { NextResponse } from "next/server";
import { safeNext } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

/** O link do e-mail aponta para aqui: troca o código por uma sessão. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeNext(url.searchParams.get("next")), url.origin));
  }
  return NextResponse.redirect(new URL("/entrar?erro=link", url.origin));
}
