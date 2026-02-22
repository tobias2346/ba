export default function Loading() {
  return (
    <section className="w-full flex-1 flex flex-col items-start px-8 md:px-[10vw] md:py-14 gap-y-4 animate-pulse">
      {/* Título */}
      <div className="h-8 w-40 bg-gray-700 rounded-md" />

      <div className="w-full md:max-w-lg mx-auto space-y-8">
        <div className="bg-transparent border-none md:bg-dark p-4 space-y-4 rounded-lg">
          {/* Avatar + nombre */}
          <div className="w-full h-28 flex items-center gap-4">
            <div className="h-28 w-28 bg-gray-700 rounded-full" />
            <div className="h-6 w-40 bg-gray-600 rounded-md" />
          </div>

          {/* Alias */}
          <div className="flex flex-col gap-y-2">
            <div className="h-4 w-12 bg-gray-600 rounded-md" />
            <div className="flex items-center justify-between gap-2 bg-gray-800 px-5 py-2 rounded-md mb-2">
              <div className="h-5 w-32 bg-gray-700 rounded-md" />
              <div className="h-7 w-7 bg-gray-700 rounded-md" />
            </div>
          </div>

          {/* Navlinks simulados */}
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-full h-10 flex items-center gap-4 border-b border-slate-600"
              >
                <div className="h-5 w-5 bg-gray-700 rounded-md" />
                <div className="h-5 w-32 bg-gray-600 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
