'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface EventContext {
  event: Event | undefined
  setEvent: (event: any) => void
  checkout: CheckoutState
  setCheckout: (checkout: any) => void
}

export interface CatalogItem {
  id: string
  name: string
  description: string[]
  includes: string[]
  type: string
  persons: number
  price: number
  maxPerPerson: number
  sectorId: string
  stock: {
    aviable: number
    reserved: number
    sold: number
  }
  isFree?: boolean;
  soldOut?: boolean;
  active: boolean
  visible: boolean
}

export interface Address {
  description: string;
  place_id: string;
}

export interface Event {
  address: Address
  banner: string
  carouselId: string
  catalogItems: CatalogItem[]
  createdAt: string
  deleted: boolean
  description: string
  endDate: string
  flyer: string
  id: string
  listIds: string[]
  name: string
  onBillboard: boolean
  onHome: boolean
  participants: any[]
  rrppIds: string[]
  soldOut: boolean
  stadiumId: string | null
  startDate: string
  state: string
  storeId: string
  store: Store
  subscribersEnabled: boolean
  tenantId: string
  trending: boolean
  type: string
  updatedAt: string
  verified: boolean
}

export interface Store {
  id: string
  name: string
  logo: string
  serviceCharge: ServiceCharge
}

export interface ServiceCharge {
  tickets: number
  combos: number
}

export interface Checkout extends CatalogItem {
  quantity: number
  isSelected: boolean
  placeType: boolean
}

// 👇 Nuevo tipo de estado para checkout
export interface CheckoutState {
  ticketType: 'comboX' | 'ticket'
  placeType: 'sectorized' | 'traditional'
  zone : string;
  tickets: Checkout[]
}

const EventContext = createContext<EventContext>({
  event: undefined,
  setEvent: function (event: any): void {
    throw new Error('Function not implemented event.')
  },
  checkout: {
    ticketType: 'ticket',
    placeType: 'traditional',
    zone : '',
    tickets: [],
  },
  setCheckout: function (checkout: any): void {
    throw new Error('Function not implemented checkout.')
  },
})

export default function EventProvider({ children }: { children: ReactNode }) {
  const [event, setEvent] = useState<Event | undefined>(undefined)

  // 👇 Estado inicial adaptado al nuevo shape
  const [checkout, setCheckout] = useState<CheckoutState>({
    ticketType: 'ticket',
    placeType: 'traditional',
    zone : '',
    tickets: [],
  })

  const value: EventContext = {
    event,
    setEvent,
    checkout,
    setCheckout,
  }

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  )
}

export const useEventContext = () => useContext(EventContext)
