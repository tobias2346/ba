export default function Loading() {
  return (
    <section className="flex flex-col justify-center items-center my-8 animate-pulse">
      {/* icono */}
      <div className="w-40 h-40 bg-slate-600 rounded-full" />

      {/* título */}
      <div className="my-3 h-6 w-40 bg-slate-600 rounded-md" />

      {/* subtítulo */}
      <div className="my-3 h-4 w-60 bg-slate-600 rounded-md" />

      {/* badge */}
      <div className="w-80 bg-secondary rounded-lg shadow h-14 flex items-center justify-between px-4">
        <div className="w-24 h-6 bg-slate-500 rounded-md" />
        <div className="w-16 h-6 bg-slate-500 rounded-md" />
      </div>

      {/* tarjeta */}
      <div className="w-80 bg-secondary rounded-lg shadow h-72 flex flex-col justify-around p-4 mb-4">
        <div className="h-5 w-32 bg-slate-500 rounded-md mb-2" />

        <div className="flex justify-between items-center w-full">
          <div className="h-4 w-24 bg-slate-500 rounded-md" />
          <div className="h-4 w-12 bg-slate-500 rounded-md" />
        </div>

        <span className="h-px bg-gray-900 w-full my-2"></span>

        <div className="flex flex-col gap-2">
          <div className="h-4 w-40 bg-slate-500 rounded-md" />
          <div className="h-4 w-40 bg-slate-500 rounded-md" />
          <div className="h-4 w-40 bg-slate-500 rounded-md" />
        </div>
      </div>

      {/* botón */}
      <div className="w-40 h-10 bg-slate-600 rounded-lg" />
    </section>
  );
}
