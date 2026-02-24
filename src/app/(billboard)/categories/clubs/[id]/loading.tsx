import React from 'react'
import { ClubEventsLoading } from './club-events/club-events-loading'
import { ClubDataLoading } from './club-data/club-data-loading'

const loading = () => {
  return (
    <section className="flex h-auto flex-col w-full justify-center items-center my-10">
      <div className="w-full lg:w-4/5 flex gap-4 p-2">
        <div className="flex flex-col w-full md:w-4/5 gap-y-4">
          <ClubDataLoading />
          <h3 className="text-3xl font-semibold">Eventos del club</h3>
          <div className="w-full h-auto flex">
            <ClubEventsLoading />
          </div>
        </div>
        <div className='w-1/5 h-[80vh] bg-secondary rounded-xl relative animate-pulse'>
        </div>
      </div>
    </section>
  )
}

export default loading