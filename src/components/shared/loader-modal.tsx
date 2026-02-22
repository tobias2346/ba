'use client'
import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';
import Image from 'next/image';

interface LoadProps {
    title : string;
    description : string;
    icon : string;
    open : boolean;
}

const LoaderModal = ({ title, description, icon, open } : LoadProps) => {
  return (
        <Dialog open={open}>
        <DialogContent className=" max-w-xs sm:max-w-sm flex flex-col justify-around items-center border-none bg-background" >
          <Image src={icon} alt="Icon" width={70} height={70} className='animate-pulse' />
          <DialogTitle className="text-xl font-semibold animate-pulse ">{title}</DialogTitle>
          <DialogDescription className="text-base font-medium text-center text-slate-300 animate-pulse">{description}</DialogDescription>
        </DialogContent>
      </Dialog>
  )
}

export default LoaderModal