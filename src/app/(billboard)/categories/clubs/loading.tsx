import React from 'react'

const Loading = () => {
  return (
     <section className="flex h-auto flex-col w-full justify-start items-start my-14 px-[15vh] min-h-[70vh]">
      <h1 className="text-3xl font-headline font-bold mb-8">Clubes</h1>
      <div className="flex flex-wrap gap-6 min-h-[40vh]">
        { [0,1,2,3,4,5,6].map(i => <div key={i} className="w-36 md:w-48 h-36 md:h-48 rounded-xl bg-slate-500 animate-pulse"></div>)}
      </div>
    </section>
  )
}

export default Loading