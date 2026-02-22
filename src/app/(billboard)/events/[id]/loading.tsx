import React from 'react';

const Loading = () => {
  return (
    <section className="flex flex-col md:flex-row-reverse bg-background md:px-[20vh] gap-x-8 py-8 px-4">
      {/* Columna izquierda: EventBuyTags + streaming box */}
      <div className="flex flex-col gap-4">
        {/* Skeleton EventBuyTag */}
        <div className="w-full md:w-80 h-20 bg-gray-700 rounded-lg animate-pulse" />
        <div className="w-full md:w-80 h-20 bg-gray-700 rounded-lg animate-pulse" />

        {/* Box streaming */}
        <div className="w-full md:w-80 h-auto animate-pulse bg-slate-800 rounded-lg flex flex-col items-center justify-start gap-4 p-4">
          {/* Icono + texto */}
          <div className="flex flex-row gap-x-4 items-start w-full">
            <div className="w-10 h-10 bg-gray-600 rounded animate-pulse" />
            <div className="flex flex-col gap-2 w-full">
              <div className="w-40 h-4 bg-gray-600 rounded animate-pulse" />
              <div className="w-32 h-3 bg-gray-600 rounded animate-pulse" />
            </div>
          </div>

          {/* QR */}
          <div className="hidden md:block w-40 h-40 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>

      {/* Columna derecha: descripción + lugar */}
      <article className="flex flex-col gap-4 grow">
        {/* Título (mobile) */}

        {/* Descripción */}
        <div className="flex flex-col items-start animate-pulse bg-slate-800 p-3 rounded-lg h-min grow">
        </div>

        {/* Lugar */}
        <div className="flex flex-col gap-2">
          <div className="w-28 h-6 bg-gray-600 rounded animate-pulse" />

          {/* Mapa */}
          <div className="w-full h-80 md:h-60 bg-gray-700 rounded-xl animate-pulse" />
        </div>
      </article>
    </section>

  );
};

export default Loading;