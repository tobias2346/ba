'use client'
import React, { useState } from 'react'
import CommonModal from '../common/common-modal'
import DynamicQR from './my-qr'
import { QrCode } from 'lucide-react'
import { CompleteProfileModal } from '../auth/complete-profile-modal'
import { useUI } from '@/contexts/ui-context'

const QrPopup = ({ logged ,user }) => {
  const [open, setOpen] = useState(false)
  const { setIsProfileModalOpen, isProfileModalOpen } = useUI()

  const cerrar = () => setIsProfileModalOpen(false)

  const handleClick = () => {
    if (user?.completed) {
      setOpen(true) // abre modal QR
    } else if(logged){
      setIsProfileModalOpen(true) // abre modal completar perfil
    }
  }

  return (
    <>
      <button
        className="flex w-12 md:w-24 h-11 justify-center items-center text-primary bg-background rounded-lg shadow"
        type="button"
        onClick={handleClick}
      >
        <QrCode className="h-6 w-6 md:mr-2" />
        <span className='hidden md:block'>Mi QR</span>
      </button>

      {/* Modal QR */}
      <CommonModal open={open} setOpen={setOpen}>
        <DynamicQR />
      </CommonModal>

      {/* Modal Perfil Incompleto */}
      <CompleteProfileModal closeFunct={cerrar} open={isProfileModalOpen} />
    </>
  )
}

export default QrPopup
