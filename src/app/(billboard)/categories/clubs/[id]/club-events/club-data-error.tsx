'use client'
import { EventCardError } from '@/components/shared/event-card-error'
import React from 'react'

const ClubEventsError = () => {
  return (
    <>
      {
        [0, 1, 2].map(e => <EventCardError key={e} />)
      }
    </>
  )
}

export default ClubEventsError