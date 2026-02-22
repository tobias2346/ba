import React from 'react'

const Loading = () => {
  return (
    <section className='w-full flex flex-col items-center gap-4 my-8 min-h-[60vh]'>
      <h1 className='text-2xl md:text-3xl font-semibold font-headline my-4'>Categorías</h1>
      <div className='bg-slate-500 animate-pulse rounded-xl w-full md:w-96 h-20'></div>
      <div className='bg-slate-500 animate-pulse rounded-xl w-full md:w-96 h-20'></div>
      <div className='bg-slate-500 animate-pulse rounded-xl w-full md:w-96 h-20'></div>
    </section>
  )
}

export default Loading