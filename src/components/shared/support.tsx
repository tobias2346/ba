'use client'
import React, { useState } from 'react'
import ContactModal from './contact-modal'

const Support = () => {
    const [open, setOpen] = useState(false)
  
  return (
    <>
      <button type='button' className="font-medium hidden md:flex w-24 h-11 justify-center items-center rounded-lg shadow transition-colors duration-200 text-base bg-background text-primary"
        onClick={() => setOpen(true)}
      >
        Soporte
      </button>
      <ContactModal setOpen={setOpen} open={open} preSelected='Soporte' />
    </>
  )
}

export default Support