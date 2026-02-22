import React from "react";
import Image from "next/image";

export const EventCardError = ({ extend }: { extend?: boolean }) => {
  return (
    <div
      className={`${
        extend
          ? "min-w-80 max-w-xs md:min-w-96 md:max-w-sm h-[400px]"
          : "min-w-80 max-w-xs h-[335px]"
      } overflow-hidden h-[345px] flex flex-col border-none shadow-lg rounded-xl transition-all duration-300 bg-error/10 border border-error/30`}
    >
      {/* Imagen de error */}
      <article className="p-0 h-1/2 flex items-center justify-center bg-error/20">
      </article>

      {/* Contenido de error */}
      <article className="h-1/2 flex flex-col font-headline items-start justify-start py-2 px-6 gap-y-2 bg-red-100/20">
        {/* categoría */}
        <div
          className={`${
            extend ? "w-24 h-4" : "w-20 h-3"
          } bg-red-300 rounded`}
        />

        {/* título */}
        <div
          className={`${
            extend ? "w-40 h-6" : "w-32 h-5"
          } bg-red-300 rounded`}
        />

        {/* info extra */}
        <div className="flex flex-wrap items-center gap-x-8 h-2/3 w-full">
          <div className="w-20 h-3 bg-red-300 rounded" />
          <div className="w-16 h-3 bg-red-300 rounded" />
          <div className="w-3/4 h-3 bg-red-300 rounded mt-2" />
        </div>
      </article>
    </div>
  );
};
