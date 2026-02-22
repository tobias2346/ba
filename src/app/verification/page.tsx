
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function VerificationSuccessPage() {
  const [countdown, setCountdown] = useState(10);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    if (countdown === 0) {
      router.push('/');
    }

    return () => clearInterval(interval);
  }, [countdown, router]);

  return (
    <Card className="w-full max-w-md mx-auto bg-dark/80 border-none">
      <CardHeader className="items-center text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <CardTitle className="text-2xl font-headline">¡Correo verificado con éxito!</CardTitle>
        <CardDescription>
          Gracias por confirmar tu correo. Tu cuenta ya está activa.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground">
          Serás redirigido a la página principal en{' '}
          <span className="font-bold text-primary">{countdown}</span> segundos...
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => router.push('/')} className="w-full">
          Ir a la página principal
        </Button>
      </CardFooter>
    </Card>
  );
}
