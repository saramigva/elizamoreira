"use client";

import { createClient } from "@/lib/supabase/client";
import { BodyMap, type BodyMapStore, type Entry } from "./BodyMap";

/** Mapa corporal ligado à base de dados (tabela `tattoos`, fotos no bucket privado `tatuagens`). */
export function LiveBodyMap({ userId, initial }: { userId: string; initial: Record<string, Entry> }) {
  const store: BodyMapStore = {
    async save(zone, level, file) {
      const supabase = createClient();
      const row: { zone: string; pain_level: number; photo_path?: string } = { zone, pain_level: level };
      if (file) {
        const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
        const path = `${userId}/${zone}-${Date.now()}.${ext}`;
        const up = await supabase.storage.from("tatuagens").upload(path, file, { contentType: file.type });
        if (up.error) return "Não foi possível carregar a foto (JPG, PNG ou WebP até 5 MB).";
        row.photo_path = path;
      }
      const { error } = await supabase.from("tattoos").upsert(row, { onConflict: "client_id,zone" });
      if (error) return "Não foi possível guardar. Tenta de novo.";
    },
    async remove(zone) {
      const supabase = createClient();
      const { data, error } = await supabase.from("tattoos").delete().eq("client_id", userId).eq("zone", zone).select("photo_path");
      if (error) return "Não foi possível remover. Tenta de novo.";
      const paths = (data ?? []).map((r) => r.photo_path).filter(Boolean) as string[];
      if (paths.length) await supabase.storage.from("tatuagens").remove(paths);
    },
  };
  return <BodyMap initial={initial} store={store} />;
}
