'use client';

import Link from "next/link";

export default function Error() {
  return (
    <section className="flex flex-col justify-center items-center my-8 text-center">
      {/* ícono de error */}
      <div className="w-40 h-40 flex items-center justify-center bg-red-600/20 rounded-full">
        <span className="text-red-500 text-6xl font-bold">!</span>
      </div>

      {/* título */}
      <h3 className="my-3 text-2xl font-semibold text-red-500">
        Ocurrió un error
      </h3>

      {/* subtítulo */}
      <p className="my-3 text-slate-300 max-w-xs">
        No pudimos cargar la información. Intenta nuevamente o contacta a nuestro equipo de soporte.
      </p>

      {/* badge simulando la caja */}
      <div className="w-80 rounded-lg shadow h-14 flex items-center justify-center px-4 bg-red-600/20 mb-1">
        <span className="text-sm font-medium text-slate-400">
          Error al obtener los datos
        </span>
      </div>

      {/* tarjeta */}
      <div className="w-80 rounded-lg shadow h-72 flex flex-col justify-center items-center p-4 mb-4 bg-red-600/20">
        <span className="text-slate-400">No hay información disponible</span>
      </div>

      {/* botón de acción */}
      <Link
        href='/'
        className="w-60 h-12 bg-primary text-black font-semibold rounded-lg shadow hover:bg-primary/80 transition-colors"
      >
        Contactar soporte
      </Link>
    </section>
  );
}
