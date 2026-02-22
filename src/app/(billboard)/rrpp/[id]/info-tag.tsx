import Image from 'next/image'
import React from 'react'

const InfoTag = ({number, text}) => {
  return (
    <div className='flex items-center gap-4 w-64 h-16 bg-background rounded-lg shadow-lg px-4'>
      <div className='flex justify-center items-center bg-secondary/50 rounded-full h-10 w-10'>
      <Image
        src='/icons/money.svg'
        width={22}
        height={22}
        alt='Money'
      />
      </div>

      <div className='flex flex-col'>
        <h4 className='text-green-500 text-xl font-semibold font-headline'>{number}</h4>
        <p className='text-sm'>{text}</p>
      </div>
    </div>
  )
}

export default InfoTag