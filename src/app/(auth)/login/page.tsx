import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/icons/logo";
import LoginForm from "./login-form";
import Loading from "./loading";

export default function LoginPage() {

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
      <LoginForm />
      <CardFooter className="flex-col items-center justify-center p-6">
        <Logo alt="Footer Logo" width={100} height={100} />
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Al continuar, aceptas nuestras Condiciones de servicio y Política de
          privacidad.
        </p>
      </CardFooter>
    </Card>
  );
}
