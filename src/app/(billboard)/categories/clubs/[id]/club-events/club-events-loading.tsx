import { EventCardLoading } from '@/components/shared/event-card-loading'
import React from 'react'

export const ClubEventsLoading = () => {
  return (
    <div className="w-full h-auto flex justify-center md:justify-start items-center flex-wrap gap-4 mb-8">
      {
        [0, 1, 2].map(e => <EventCardLoading key={e} />)
      }
    </div>
  )
}
