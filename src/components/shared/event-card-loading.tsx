import React from 'react'

export const EventCardLoading = ({ extend }: { extend?: boolean }) => {
  return (
    <div
      className={`${extend
        ? 'min-w-80 max-w-xs md:min-w-96 md:max-w-sm h-[400px]'
        : 'min-w-80 max-w-xs h-[335px]'
        } overflow-hidden h-[345px] flex flex-col border-none shadow-lg rounded-xl transition-all duration-300`}
    >
      {/* Skeleton imagen */}
      <article className="p-0 h-1/2">
        <div className="w-full h-full bg-dark animate-pulse" />
      </article>

      {/* Skeleton contenido */}
      <article className="h-1/2 flex flex-col font-headline items-start justify-between p-6 bg-slate-800">
        {/* categoría */}
        <div className='space-y-2'>
          <div
            className={`${extend ? 'w-60 h-8' : 'w-52 h-7'
              }  bg-primary/50 rounded-xl animate-pulse`}
          />

          {/* título */}
          <div
            className={`${extend ? 'w-40 h-6' : 'w-32 h-5'
              }  bg-primary/50 rounded-xl animate-pulse`}
          />
        </div>
        <div className='space-y-2'>
          {/* info extra */}
          <div className="w-60 h-3  bg-dark rounded-xl animate-pulse" />
          <div className="w-52 h-3  bg-dark rounded-xl animate-pulse" />
        </div>
      </article>
    </div>

  )
}
