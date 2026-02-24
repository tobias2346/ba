import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export interface Club {
  id: string;
  name: string;
  taxId: string;
  category: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  logo: string;
  enabled: boolean;
  deleted: boolean;
  subscribersCount: number;
  rrppCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ClubCardProps {
  club: Club;
}

const ClubCard = ({ club }: ClubCardProps) => {
  return (
    <Link
      className="w-36 md:w-48 h-36 md:h-48 rounded-xl flex flex-col justify-center items-center bg-light hover:bg-primary/50 shadow-xl transition-all duration-100"
      href={`/categories/clubs/${club.id}`}
    >
      <Image
        src={club.logo}
        alt={`Escudo del Club ${club.name}`}
        width={100}
        height={100}
        className="object-contain w-1/2 h-3/5"
      />
      <h4 className='text-lg font-semibold font-headline text-center'>{club.name}</h4>
    </Link>
  )
}

export default ClubCard