import Image from 'next/image'
import React, { useEffect, useState } from 'react'

const Butaca = ({ handleSeatClick, selectedSeats, selectedSector, selectedStand, setSelectedSector }) => {
  const [page, setPage] = useState(0)
  const [seatsPerPage, setSeatsPerPage] = useState(10) // 🔹 valor por defecto desktop

  // 🔹 Detectar si es mobile
  useEffect(() => {
    const updateSeatsPerPage = () => {
      if (window.innerWidth < 768) setSeatsPerPage(5) // mobile
      else setSeatsPerPage(10) // desktop
    }

    updateSeatsPerPage()
    window.addEventListener('resize', updateSeatsPerPage)

    return () => window.removeEventListener('resize', updateSeatsPerPage)
  }, [])
  // 🔹 Agrupar los asientos por fila (rowLabel)
  const rowsMap = selectedSector?.seats?.reduce((acc, seat) => {
    if (!acc[seat.rowLabel]) acc[seat.rowLabel] = []
    acc[seat.rowLabel].push(seat)
    return acc
  }, {}) || {}

  // 🔹 Convertir a array y ordenar por fila (A, B, C, ...)
  const rows = Object.entries(rowsMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([rowLabel, seats]) => ({
      rowLabel,
      seats: seats.sort((a, b) => a.seatNumber - b.seatNumber)
    }))

  // 🔹 Determinar máximo número de asientos por fila
  const maxSeats = Math.max(...rows.map(r => r.seats.length))
  const maxPage = Math.floor((maxSeats - 1) / seatsPerPage)

  const handleNextPage = () => setPage(prev => Math.min(prev + 1, maxPage))
  const handlePrevPage = () => setPage(prev => Math.max(prev - 1, 0))

  return (
    <div className="w-full md:bg-secondary/40 rounded-lg shadow flex flex-col justify-center items-center p-6">
      <div className='w-full h-auto flex flex-col gap-y-8 md:gap-y-5 items-center p-1 mb-8 overflow-x-auto soft-scrollbar'>

        <h2 className="text-2xl font-bold font-headline text-primary">
          Sector: {selectedSector.name} {selectedStand?.name || ''}
        </h2>

        <div className="w-full flex justify-between items-center">
          <h3 className="text-lg font-bold font-headline text-light">
            Seleccionar butaca
          </h3>
        </div>

        {/* 🔹 Mostrar butacas por fila */}
        <div className="w-auto md:h-96 flex justify-between items-start gap-6 m-4 overflow-y-auto soft-scrollbar  ">
          <div className='w-auto h-full flex justify-center items-center '>

            {page !== 0 && (
              <button onClick={handlePrevPage}>
                <Image src='/icons/arrow-left.svg' width={25} height={25} alt='Arrow left' />
              </button>
            )}
          </div>

          <div className='w-4/6 h-auto flex flex-col justify-center items-center space-y-3 '>
            {rows.map((row) => {
              const start = page * seatsPerPage
              const end = start + seatsPerPage
              const seatsToShow = row.seats.slice(start, end)

              return (
                <div key={row.rowLabel} className='flex flex-col items-center gap-2'>
                  <div className="flex gap-2 justify-center">
                    {seatsToShow.map((seat) => {
                      const isSelected = selectedSeats.includes(seat.code)
                      const isReserved = seat.status === 'reserved'
                      const isSold = seat.status === 'sold'

                      let seatClass = 'bg-secondary hover:bg-primary/70 text-light'
                      if (isSelected) seatClass = 'bg-primary text-light'
                      else if (isReserved || isSold) seatClass = 'bg-error text-light cursor-not-allowed'

                      return (
                        <button
                          key={seat.code}
                          onClick={() => handleSeatClick(seat.rowLabel, seat.seatNumber)}
                          // disabled={i sReserved || isSold}
                          className={`min-w-11 md:w-12 2xl:w-14 min-h-11 md:h-12 2xl:h-14 font-semibold shadow flex justify-center items-center rounded-full text-base 2xl:text-lg transition-colors ${seatClass}`}
                        >
                          {seat.rowLabel}{seat.seatNumber}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <div className='w-auto h-full flex justify-center items-center '>
            {page !== maxPage && (
              <button onClick={handleNextPage}>
                <Image src='/icons/arrow-left.svg' width={25} height={25} alt='Arrow right' className='rotate-180' />
              </button>
            )}
          </div>
        </div>

        {/* 🔹 Paginador */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handlePrevPage}
            disabled={page === 0}
            className={`px-3 py-1 rounded-md text-sm font-semibold shadow 
              ${page === 0 ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-primary text-light hover:bg-primary/80'}`}
          >
            Anterior
          </button>

          <span className="text-light font-semibold text-sm font-headline">
            Página {page + 1} de {maxPage + 1}
          </span>

          <button
            onClick={handleNextPage}
            disabled={page === maxPage}
            className={`px-3 py-1 rounded-md text-sm font-semibold shadow 
              ${page === maxPage ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-primary text-light hover:bg-primary/80'}`}
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* 🔹 Butacas seleccionadas */}
      <div className='w-full flex items-center my-2 gap-2 border-y border-slate-600 py-4 justify-start flex-wrap truncate'>
        <h6 className='font-semibold text-light'>Butacas seleccionadas:</h6>
        {selectedSeats.map(seat => (
          <p className='text-light font-medium text-ellipsis' key={seat}>{seat}</p>
        ))}
      </div>

      {/* 🔹 Leyenda */}
      <div className='w-full flex items-center my-2 gap-2 py-4 justify-start flex-wrap'>
        <span className='w-10 h-10 shadow bg-primary rounded-full'></span>
        <h3 className='text-light font-semibold mr-4'>Seleccionada</h3>
        <span className='w-10 h-10 shadow bg-error rounded-full'></span>
        <h3 className='text-light font-semibold mr-4'>Reservada</h3>
        <span className='w-10 h-10 shadow bg-secondary rounded-full'></span>
        <h3 className='text-light font-semibold mr-4'>Disponible</h3>
      </div>
    </div>
  )
}

export default Butaca
