import { EventCardLoading } from '@/components/shared/event-card-loading'
import React from 'react'

const Loading = () => {
  return (
    <section className=' flex flex-col justify-center items-center h-auto gap-16 w-full mb-16'>
      <div className='w-full h-[60vh] bg-dark animate-pulse flex flex-col justify-center p-4 md:px-[20vw] gap-y-4 '>
        <div className='w-60 h-10 rounded-lg bg-secondary block md:hidden'></div>
        <div className='w-20 h-4 rounded-lg bg-primary/50 block md:hidden'></div>
      </div>
      <div className='container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-4'>
        {
          [0, 1, 25].map(e => <EventCardLoading extend key={e} />)
        }
      </div>
    </section>
  )
}

export default Loading