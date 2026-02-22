"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/user-context";
import QRCode from "qrcode";

export default function DynamicQR() {
  const { user } = useUser();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // if (!user?.alias) return;

    const generateQR = async () => {
      try {
        setLoading(true);
        const data = JSON.stringify({alias : user?.alias})
        const url = await QRCode.toDataURL(data, {
          width: 200,
          margin: 2,
          color: {
            dark: "#2DAFCF",
            light: "#313B45",
          },
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error("Error generando QR:", err);
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, [user?.alias]);

  return (
    <div className="p-6 flex flex-col items-center gap-4 font-headline">
      <div className="bg-[#313B45] p-5 rounded-xl shadow flex items-center justify-center">
        {loading ? (
          <span className="text-slate-300 text-sm">Generando QR...</span>
        ) : (
          qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="rounded-xl" />
        )}
      </div>
      {user?.alias && (
        <>
          <h4 className="text-lg font-medium">{user.alias}</h4>
          <p className="text-sm font-medium text-center text-slate-300">
            Este código QR es personal e intransferible. Utilizalo como credencial
            para acceder a todos tus eventos.
          </p>
        </>
      )}
    </div>
  );
}
