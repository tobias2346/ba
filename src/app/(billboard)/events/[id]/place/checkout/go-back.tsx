'use client'
import CommonButton from '@/components/common/common-button'
import modalFeedbackReact from '@/components/shared/feedback-modal'
import { useRouter } from 'next/navigation'
import React from 'react'

const GoBack = () => {

  const router = useRouter()

  const goBack = () => modalFeedbackReact(
    "Advertencia",
    "Si cancelas la compra, todo el pedido se perderá",
    "warning",
    true,
    [
      {
        text: "Cancelar",
        action: () => router.push('/'),
        type: "primary",
      }
    ]
  )


  return (
    <CommonButton extend text='Cancelar' type='ghost' action={goBack} />
  )
}

export default GoBack