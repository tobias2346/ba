import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import ChangeInfoForm from "./chenge-info-form"; // si el archivo real se llama "change-info-form", corregí también el import

export default function ChangeInfoPage() {
  return (
    <section className="w-full flex-1 flex flex-col items-center px-4 py-8 md:px-[10vw] md:py-14 gap-y-4">
      <div className='w-full mb-2'>
        <Link href="/my-account" className="text-primary flex items-center gap-x-2">
          <Image src="/icons/arrow-left.svg" alt="Arrow left" width={15} height={15} />
          Volver a mi cuenta
        </Link>
      </div>
      <div className="w-full md:max-w-lg mx-auto">
        {/* Necesario si ChangeInfoForm (client) usa useSearchParams */}
        <Suspense fallback={<div className="py-8 text-muted-foreground">Cargando información…</div>}>
          <ChangeInfoForm />
        </Suspense>
      </div>
    </section>
  );
}
