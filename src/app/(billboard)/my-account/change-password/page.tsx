import React from 'react'
import ChangePassword from './change-password'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const page = () => {
  return (
    <section className="w-full flex-1 flex flex-col items-center px-4 py-8 md:px-[10vw] md:py-14 gap-y-4">
      <div className='w-full mb-2'>
        <Link href="/my-account"
          className='text-primary flex items-center gap-x-2 '
        >
          <Image src='/icons/arrow-left.svg' alt='Arrow left' width={14} height={14} />
          Volver a mi cuenta
        </Link>
      </div>
      <h1 className='text-3xl font-semibold font-headline'>Actualizar contraseña</h1>
      <div className="w-full md:max-w-lg mx-auto">
        <Card className="bg-transparent  border-none md:bg-dark font-headline">
          <CardHeader>
            <p className='text-sm font-medium'>
              Para tu seguridad, te recomendamos que elijas una contraseña fuerte.
            </p>
          </CardHeader>
          <CardContent>
            <ChangePassword/>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default page