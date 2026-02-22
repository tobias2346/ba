import React from 'react'

export const ClubDataLoading = () => {
  return (
    <div className="w-full h-40 bg-secondary flex items-center rounded-xl animate-pulse px-10 gap-8">
      <span className='w-24 h-24 rounded-full bg-slate-600 animate-pulse'></span>
      <span className='w-80 h-8 rounded-full bg-slate-600 animate-pulse'></span>
    </div>
  )
}
