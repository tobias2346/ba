'use client'
import React, { useState } from 'react'
import ContactModal from './contact-modal'

const Atention = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-light/80"
      >
        Contacto comercial
      </button>

      <ContactModal setOpen={setOpen} open={open} preSelected='Comercial' />
    </>
  )
}

export default Atention
