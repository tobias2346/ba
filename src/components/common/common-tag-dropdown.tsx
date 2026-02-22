'use client'
import Image from 'next/image'
import React, { useState, useEffect, useRef } from 'react'

const CommonTagDropdown = ({ loading, icon, text, options, onSelect }) => {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const ref = useRef<HTMLDivElement>(null)

  const toggleOption = (option) => {
    let newSelected: string[]
    if (selected.includes(option.id)) {
      newSelected = selected.filter((v) => v !== option.id)
    } else {
      newSelected = [...selected, option.id]
    }
    setSelected(newSelected)
    onSelect?.(option.id) // 👉 devolvemos solo el id
  }

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Texto del botón
  const displayText =
    selected.length > 0
      ? selected
        .map((id) => options.find((o) => o.id === id)?.name)
        .filter(Boolean)
        .join(', ')
      : text

  return (
    <div className='relative w-1/4 max-w-[25%] ' ref={ref}>
      {/* Botón principal */}
      <button
        type="button"
        onClick={() => {
          if (!loading) setOpen(!open)
        }}
        className="flex justify-between items-center w-full h-14 p-4 ring-1 ring-primary/30 rounded-lg shadow gap-x-6 transition-all duration-300 hover:bg-primary/40"
      >
        <div className="flex items-center gap-x-2 w-3/5">
          <h6 className="truncate text-ellipsis font-semibold text-base">
            {loading ? 'Cargando...' : displayText}
          </h6>
        </div>
        <Image
          src="/icons/arrow-down.svg"
          alt="arrow"
          width={20}
          height={20}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-10 mt-2 w-full bg-background border border-primary/30 rounded-lg shadow-lg max-h-60 overflow-y-auto animate-fade-in">
          {options.map((option) => {
            const isSelected = selected.includes(option.id)
            return (
              <button
                type="button"
                onClick={() => toggleOption(option)}
                key={option.id}
                className={`w-full flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-primary/20 ${isSelected && "bg-primary/30"}`}
              >
                <span className="text-sm flex-1 text-left">{option.name}</span>
                {isSelected && <span className="text-xs font-medium text-primary">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CommonTagDropdown
