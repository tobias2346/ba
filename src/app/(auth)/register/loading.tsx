import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Loading() {

  return (
    <Card className="w-full md:max-w-lg mx-auto bg-dark/80 border-none rounded-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-headline ">Bienvenido de vuelta</CardTitle>
        <CardDescription className="text-base text-light/50">
          Inicia sesión para acceder a tus tickets
        </CardDescription>
      </CardHeader>
      <CardContent className="animate-pulse space-y-6">

        {/* GRID CAMPOS PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Email */}
          <div className="md:col-span-2 space-y-2">
            <div className="h-4 w-28 bg-slate-800 rounded" />
            <div className="h-10 w-full bg-slate-800 rounded" />
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <div className="h-4 w-20 bg-slate-800 rounded" />
            <div className="h-10 w-full bg-slate-800 rounded" />
          </div>

          {/* Apellido */}
          <div className="space-y-2">
            <div className="h-4 w-20 bg-slate-800 rounded" />
            <div className="h-10 w-full bg-slate-800 rounded" />
          </div>

          {/* DNI/ID */}
          <div className="space-y-2">
            <div className="h-4 w-16 bg-slate-800 rounded" />
            <div className="h-10 w-full bg-slate-800 rounded" />
          </div>

          {/* Nacionalidad */}
          <div className="space-y-2">
            <div className="h-4 w-24 bg-slate-800 rounded" />
            <div className="h-10 w-full bg-slate-800 rounded" />
          </div>

          {/* Alias */}
          <div className="md:col-span-2 space-y-2">
            <div className="h-4 w-16 bg-slate-800 rounded" />
            <div className="h-10 w-full bg-slate-800 rounded relative" />
          </div>

        </div>


        {/* BOTÓN REGISTRAR */}
        <div className="h-12 w-full bg-slate-800 rounded-lg" />
      </CardContent>
      <CardFooter className="flex-col items-center justify-center p-6">
        <p className="text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
