"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

/** QR único do cliente: aponta para o site com o código de referência. */
export function ReferralQR({ code }: { code: string }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    const url = `${window.location.origin}/?ref=${encodeURIComponent(code)}`;
    QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#0f113a", light: "#F3EFE4" } }).then(setSvg);
  }, [code]);
  return <div className="qr" role="img" aria-label={`Código QR de referência ${code}`} dangerouslySetInnerHTML={{ __html: svg }} />;
}
