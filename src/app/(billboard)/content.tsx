'use client'
import { EventCarousel } from '@/components/home/event-carousel'
import EventFilterDesktop from '@/components/home/event-filter'
import { MainEventCarousel } from '@/components/home/event-main-carrousel'
import { EventCardLoading } from '@/components/shared/event-card-loading'
import React, { useState } from 'react'

const Content = ({ data }) => {

  const [rawData, setRawData] = useState(data)
  const [filteredData, setFilteredData] = useState(data)
  const [loading, setLoading] = useState(false)

  // Buscar la primera key que no sea trending
  const firstKey = Object.keys(filteredData).find((k) => k !== "trending")

  return (
    <>
      {/* Filtros */}
      <div className="flex justify-center items-center w-full h-auto gap-8 py-5 md:py-10 px-4 bg-dark">
        <EventFilterDesktop
          setLoading={setLoading}
          setData={setFilteredData}
          data={rawData}
          setRawData={setRawData}
        />
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-4">
          {[0, 1, 2, 3].map((e) => (
            <EventCardLoading extend key={e} />
          ))}
        </div>
      ) : !firstKey ? (
        <div className="text-center text-gray-400 my-20 text-xl">No hay eventos disponibles</div>
      ) : (
        <div className="w-full p-0 py-8 md:px-12 xl:px-28 md:py-12 space-y-12">
          {/* Primer carrusel principal */}
          {filteredData[firstKey]?.length > 0 && (
            <MainEventCarousel title={firstKey} events={filteredData[firstKey]} />
          )}

          {/* Resto de carruseles */}
          {Object.entries(filteredData)
            .filter(([key]) => key !== "trending" && key !== firstKey) // excluimos trending y el primero
            .map(
              ([key, value]) =>
                value?.length > 0 && (
                  <EventCarousel title={key} key={key} events={value} />
                )
            )}
        </div>
      )}
    </>
  )
}

export default Content
