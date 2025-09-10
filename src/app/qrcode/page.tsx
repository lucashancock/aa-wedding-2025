"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";

export default function QrCodePage() {
  const [qrCode, setQrCode] = useState<string>("");

  useEffect(() => {
    // TO-DO: find a way to hide these.
    const domain =
      "aa-wedding-2025--aa-wedding-photo-share.us-central1.hosted.app";
    const token = "AAWEDDING2025";
    const url = `https://${domain}/?token=${token}`;

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
