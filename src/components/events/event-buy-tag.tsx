'use client'

import Image from 'next/image'
import React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useUser } from '@/contexts/user-context'
import { useEventContext } from '@/app/(billboard)/events/[id]/context/eventContext'
import modalFeedbackReact from '../shared/feedback-modal'

interface EventBuyTagProps {
  link: string
  icon: string
  altIcon: string
  title: string
  price: string
  type: string
}

const EventBuyTag = ({ type, link, icon, altIcon, title, price }: EventBuyTagProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { logged } = useUser()
  const { checkout, setCheckout, event } = useEventContext()

  const getCurrentPathWithQueryAndHash = () => {
    const sp = searchParams.toString();
    const hash = window.location.hash || "";
    const back = `${pathname}${sp ? `?${sp}` : ""}${hash}`;
    return back
  }

  const goLoginWithBack = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('postLoginRedirect', getCurrentPathWithQueryAndHash())
      }
    } catch {}
    router.push('/login')
  }

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (!logged) {
      modalFeedbackReact(
        'No identificado',
        'Debes iniciar sesión para comprar una entrada.',
        'info',
        true,
        [
          {
            text: 'Identificarse',
            action: goLoginWithBack,
            type: 'primary',
          },
        ],
      )
      return
    }

    setCheckout({ ...checkout, ticketType: type, placeType: event!.type })
    router.push(link)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full md:w-80 h-20 bg-secondary hover:bg-primary/50 transition-all duration-300 rounded-lg flex items-center justify-start gap-x-4 px-4 relative text-light"
    >
      <Image src={icon} width={30} height={30} alt={altIcon} />
      <div className="flex flex-col items-start justify-start">
        <h3 className="font-semibold text-base">{title}</h3>
        <h6 className="text-sm">{price}</h6>
      </div>
      <Image
        src="/icons/arrow-rigth.svg"
        width={10}
        height={10}
        alt="arrow"
        className="absolute right-4"
      />
    </button>
  )
}

export default EventBuyTag
