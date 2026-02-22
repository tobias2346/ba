
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TimerOff } from 'lucide-react';
import Link from 'next/link';

export default function ExpiredTokenPage() {
  const router = useRouter();

  return (
     <Card className="w-full max-w-md mx-auto bg-dark/80 border-none">
      <CardHeader className="items-center text-center">
        <TimerOff className="h-16 w-16 text-destructive mb-4" />
        <CardTitle className="text-2xl font-headline">¡El enlace ha expirado!</CardTitle>
        <CardDescription>
          Por tu seguridad, los enlaces de verificación tienen un tiempo límite.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground">
          Por favor, solicita un nuevo enlace desde tu perfil o intenta iniciar sesión para que te lo reenviemos.
        </p>
      </CardContent>
      <CardFooter className='flex-col gap-2'>
        <Button onClick={() => router.push('/login')} className="w-full">
          Ir a Iniciar Sesión
        </Button>
         <Button variant="outline" onClick={() => router.push('/')} className="w-full">
          Volver a la página principal
        </Button>
      </CardFooter>
    </Card>
  );
}
