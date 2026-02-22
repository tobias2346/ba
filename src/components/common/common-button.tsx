import React from 'react'
import { cn } from '@/lib/utils'

export interface CommonButtonType {
  type: "secondary" | "primary" | "ghost" ,
  extend?: true
  text: string,
  disabled? : boolean,
  action?: () => void
}

const CommonButton = ({ type, text, action, extend, disabled }: CommonButtonType) => {
  const buttonClasses = cn(
    'px-4 py-2 font-medium rounded-lg shadow transition-colors duration-200 text-base',
    {
      'px-10 py-2' : extend,
      'bg-primary text-black hover:bg-primary/80': type === 'primary',
      'bg-secondary text-primary hover:bg-secondary/80': type === 'secondary',
      'bg-transparent ring-1 ring-primary text-primary hover:bg-primary/10': type === 'ghost',
      'bg-gray-400 text-white cursor-not-allowed opacity-60': disabled,
    }
  )

  return (
    <button
      className={buttonClasses}
      type='button'
      onClick={disabled ? undefined : action }
      disabled={disabled}
    >
      {text}
    </button>
  )
}

export default CommonButton
