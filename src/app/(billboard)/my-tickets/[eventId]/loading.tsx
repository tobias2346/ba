import React from "react"

const Loading = () => {
  return (
    <section className="flex-1 flex flex-col items-start p-8 md:p-20 gap-y-4">
      <h4 className="text-3xl font-semibold font-headline">Seleccionar tipo</h4>
      <div className="w-full flex flex-wrap gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-96 h-28 bg-slate-800 rounded-xl flex flex-col justify-around p-4  animate-pulse"
          >
            <div className="bg-slate-700 rounded-md w-40 h-6"></div>
            <div className="bg-slate-700 rounded-md w-32 h-5"></div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Loading
