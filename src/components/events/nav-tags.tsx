'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

const NavTags = ({ selectedIndex, tags }: { selectedIndex: number; tags: string[] }) => {

  const router = useRouter()

  return (
    <nav className='w-full hidden md:flex justify-between items-center my-2 text-sm font-headline px-4 md:p-0'>
      {/* Botón de volver */}
      <button
        type='button'
        onClick={() => router.back()}
        className='text-primary flex items-center gap-x-2'
      >
        <Image src='/icons/arrow-left.svg' alt='Arrow left' width={15} height={15} />
        Volver
      </button>
      {/* Lista de pasos */}
      <ul className='flex items-center gap-x-4 text-base'>
        {tags.map((tag, i) => (
          <React.Fragment key={tag}>
            <li className={i === selectedIndex ? 'text-primary' : 'text-primary hidden md:block'}>
              {tag}
            </li>
            {/* Renderiza la flecha solo si no es el último tag */}
            {i < tags.length - 1 && (
              <Image
                src='/icons/arrow-rigth.svg'
                alt='Arrow right'
                width={6}
                height={6}
              />
            )}
          </React.Fragment>
        ))}
      </ul>
    </nav>
  )
}

export default NavTags
