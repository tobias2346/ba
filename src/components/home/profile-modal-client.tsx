'use client'
import React, { useEffect } from 'react'
import { CompleteProfileModal } from '../auth/complete-profile-modal'
import { useUI } from '@/contexts/ui-context'
import { useUser } from '@/contexts/user-context'

const ProfileModalClient = () => {

  const { setIsProfileModalOpen, isProfileModalOpen } = useUI()
  const { logged ,user} = useUser()
  const cerrar = () => setIsProfileModalOpen(false);

  useEffect(() => {
    if(logged  && user?.completed === false){
      setIsProfileModalOpen(true)
    }else{
      setIsProfileModalOpen(false)
    }
  }, [])
  
  return (
    <CompleteProfileModal closeFunct={cerrar} open={isProfileModalOpen} />
  )
}

export default ProfileModalClient