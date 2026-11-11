import type { Metadata, Viewport } from "next";
import "@fontsource/fascinate";
import "@fontsource/marcellus";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "./globals.css";
import { RefCapture } from "@/components/RefCapture";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: { default: `${site.name} Tattoo · Lisboa`, template: `%s · ${site.name} Tattoo` },
  description: `${site.name}, tatuadora independente em Lisboa. ${site.styles}. ${site.heroLine}`,
};

export const viewport: Viewport = { themeColor: "#0f113a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body>
        <RefCapture />
        {children}
      </body>
    </html>
  );
}
