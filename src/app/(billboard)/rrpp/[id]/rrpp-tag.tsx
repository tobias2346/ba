'use client'
import Image from 'next/image'
import React, { useState, useRef } from 'react'
import InfoTag from './info-tag'

const RrppTag = ({name, catalogItemId, itemTotal, type, quantityRefunded, quantityTotal, totalRefunded,commissionEarned}) => {
  
  const [open, setOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative w-full max-w-4xl">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full bg-secondary h-14 flex items-center justify-between px-5 ${ open ? 'rounded-t-lg' : 'rounded-lg' }`}
      >
        <div className="w-auto flex gap-x-2">
          <Image
            src="/icons/code.svg"
            width={28}
            height={28}
            alt="code"
          />
          <p className="font-semibold">{name}</p>
        </div>
        <Image
          src="/icons/arrow-down.svg"
          alt="arrow"
          width={15}
          height={15}
          className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Contenedor animado con la lógica del despliegue */}
      <div
        ref={contentRef}
        className="transition-all duration-500 h-auto ease-in-out overflow-hidden bg-secondary rounded-b-lg"
        style={{
          maxHeight: open ? contentRef.current?.scrollHeight : 0,
          opacity: open ? 1 : 0,
        }}
      >
        <div className='flex flex-wrap gap-4 p-4 md:h-44 md:max-h-44 py-2'>
          <InfoTag text='Vendidos' number={quantityTotal} />
          <InfoTag text='Transacciones' number='' />
          <InfoTag text='Total devoluciones' number={totalRefunded} />
          <InfoTag text='Total transaccionado' number={itemTotal} />
          <InfoTag text='Comisión Total' number={commissionEarned} />
        </div>
      </div>
    </div>
  )
}

export default RrppTag
