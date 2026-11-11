import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SupportChat, toMsgs } from "@/app/portal/SupportChat";
import { AppShell } from "@/components/Chrome";
import { getSessionProfile } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Ticket", robots: { index: false } };

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect("/entrar?next=/painel");
  if (profile?.role !== "admin" || !Number.isInteger(id)) notFound();

  const { data: ticket } = await supabase.from("tickets").select("id, client_id, subject, status").eq("id", id).single();
  if (!ticket) notFound();
  const [{ data: client }, { data: messages }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", ticket.client_id).single(),
    supabase.from("messages").select("sender_role, body").eq("ticket_id", id).order("id"),
  ]);

  return (
    <AppShell avatar="EM">
      <Link className="link" href="/painel">← painel</Link>
      <h1 className="title">{client?.full_name || "(sem nome)"}</h1>
      <SupportChat as="eliza" ticket={{ id: ticket.id, subject: ticket.subject, open: ticket.status === "open" }} initial={toMsgs(messages ?? [])} />
    </AppShell>
  );
}
