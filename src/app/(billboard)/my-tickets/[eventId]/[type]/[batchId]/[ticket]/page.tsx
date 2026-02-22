"use client";
import React, { use, useState } from "react";
import ManageTag from "./manage-tag";
import ModalSelector, { ModalState } from "./modal-selector";
import Image from "next/image";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

type ModalType = "assign" | "transfer" | "share" | "";

export default function Page({
  params,
}: {
  params: Promise<{ ticket: string; eventId: string }>;
}) {
  const accessId = use(params).ticket;

  const path = usePathname();

  const [modal, setModal] = useState<ModalState>({
    open: false,
    type: "",
  });

  const mock = [
    {
      id: 1,
      name: "Asignar",
      icon: "/icons/add-person.svg",
      description: "Invitá a tus amigos ingresando su Alias.",
      type: "assign" as ModalType,
      action: () => setModal({ open: true, type: "assign" }),
    },
    {
      id: 2,
      name: "Transferir",
      icon: "/icons/transfer.svg",
      description:
        "Al transferirlos, no podrás verlos y lo controlará quien lo reciba.",
      type: "transfer" as ModalType,
      action: () => setModal({ open: true, type: "transfer" }),
    },
  ];

  const buildShareUrl = (path: string) => {
    const url = new URL(path, window.location.origin);

    const parts = url.pathname.split("/").filter(Boolean);

    const eventId = parts[1];
    const accessesId = parts[4];

    if (!eventId || !accessesId) {
      throw new Error("No pude extraer eventId o accessesId del path.");
    }

    const share = new URL(`/events/${eventId}`, url.origin);
    share.searchParams.set("accessesid", accessesId);

    return share.toString();
  };

  const copyAliasToClipboard = () => {
    try {
      const shareUrl = buildShareUrl(path);
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link de ticket copiado");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo generar el link.");
    }
  };

  return (
    <>
      <section className="flex flex-col md:px-[20vh] gap-x-8 py-8 px-4 gap-8">
        <h4 className="text-2xl font-semibold font-headline">
          Gestionar tickets
        </h4>
        <div className="w-full flex flex-wrap justify-center md:justify-start gap-6">
          {mock.map((item) => (
            <ManageTag key={item.id} {...item} />
          ))}
          <button
            type="button"
            onClick={copyAliasToClipboard}
            className="w-80 h-48 flex flex-col items-start bg-secondary rounded-xl p-4 gap-3 shadow transition-all duration-300 hover:bg-primary/20 cursor-pointer"
          >
            <div className="flex flex-col items-start gap-3">
              <Image
                src="/icons/share.svg"
                alt="Compartir link"
                width={45}
                height={45}
              />
              <h4 className="text-lg font-semibold">Compartir link</h4>
            </div>
            <p className="text-sm text-slate-300 text-start">
              Asigná tus tickets por medio de un link.
            </p>
          </button>
        </div>
      </section>
      <ModalSelector modal={modal} setModal={setModal} accessId={accessId} />
    </>
  );
}
