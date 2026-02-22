import { Logo } from '@/components/icons/logo';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

const Loading = () => {
  return (
    <Card className="w-full md:max-w-md mx-auto bg-dark/80 border-none rounded-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-headline ">
          Bienvenido de vuelta
        </CardTitle>
        <CardDescription className="text-base text-light/50">
          Inicia sesión para acceder a tus tickets
        </CardDescription>
      </CardHeader>
   <CardContent className="space-y-4 animate-pulse">

      {/* Email */}
      <div className="space-y-2">
        <div className="h-4 w-32 bg-slate-800 rounded" /> 
        <div className="h-10 w-full bg-slate-800 rounded-md" />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="h-4 w-24 bg-slate-800 rounded" />
        <div className="h-10 w-full bg-slate-800 rounded-md" />
      </div>

      {/* Remember me */}
      <div className="flex items-center space-x-2">
        <div className="h-5 w-5 bg-slate-800 rounded-md" />
        <div className="h-4 w-20 bg-slate-800 rounded" />
      </div>

      {/* Submit button */}
      <div className="h-10 w-full bg-slate-800 rounded-md" />

      {/* Forgot password */}
      <div className="flex justify-center">
        <div className="h-4 w-40 bg-slate-800 rounded" />
      </div>

      {/* Divider */}
      <div className="relative my-4">
        <div className="h-px w-full bg-muted" />
      </div>

      {/* Google button */}
      <div className="h-12 w-full bg-slate-800 rounded-md" />

      {/* Register link */}
      <div className="flex justify-center">
        <div className="h-4 w-48 bg-slate-800 rounded" />
      </div>

    </CardContent><CardFooter className="flex-col items-center justify-center p-6">
        <Logo alt="Footer Logo" width={100} height={100} />
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Al continuar, aceptas nuestras Condiciones de servicio y Política de
          privacidad.
        </p>
      </CardFooter>
    </Card>
  );
};

export default Loading;