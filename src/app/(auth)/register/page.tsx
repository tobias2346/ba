import Link from "next/link"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import RegisterForm from "./register-form"

export default function RegisterPage() {

  return (
    <Card className="w-full md:max-w-lg mx-auto bg-dark/80 border-none rounded-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-headline ">Bienvenido de vuelta</CardTitle>
        <CardDescription className="text-base text-light/50">
          Inicia sesión para acceder a tus tickets
        </CardDescription>
      </CardHeader>
      <RegisterForm />
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
