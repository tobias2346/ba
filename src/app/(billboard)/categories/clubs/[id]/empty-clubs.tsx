import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const EmptyClubs = () => {
  
  return (
    <div className="w-full flex flex-col justify-center items-center gap-y-4 my-8">
      <Image
        width={100}
        height={100}
        alt="Calendar"
        src="/icons/big-calendar.svg"
      />
      <p className="text-gray-500 text-lg">El club no tiene partidos disponibles</p>
      <Link
        href="/"
        className="px-4 py-2 font-medium rounded-lg shadow transition-colors duration-200 text-sm xl:text-base bg-primary text-black hover:bg-primary/80"
      >
        Volver al inicio
      </Link>
    </div>
  )
}

export default EmptyClubs