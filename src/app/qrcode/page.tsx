"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";

export default function QrCodePage() {
  const [qrCode, setQrCode] = useState<string>("");

  useEffect(() => {
    const url = `"https://${process.env.DOMAIN}/?token=${process.env.MAGIC_TOKEN}`;

    QRCode.toDataURL(url)
      .then((dataUrl) => {
        setQrCode(dataUrl);
      })
      .catch((err) => {
        console.error("Failed to generate QR code", err);
      });
  }, []);

  if (!qrCode) {
    return <p className="text-white">Generating QR code...</p>;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="relative w-64 h-64">
        <Image src={qrCode} alt="QR code" fill />
      </div>
    </div>
  );
}
