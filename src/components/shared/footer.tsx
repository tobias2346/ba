import Link from "next/link";
import { Logo } from "../icons/logo";
import Image from "next/image";
import Atention from "./atention-modal";

export function Footer() {

  return (
    <footer className="flex flex-col items-start bg-dark gap-y-6 p-6 w-full md:px-[20vh] text-primary">
      <div className="flex flex-col md:flex-row gap-8 w-full justify-between">
        <div>
          <Logo alt="Footer Logo" width={140} height={140} />
        </div>
        <article className="flex gap-8 font-headline">
          <div className="flex flex-col items-start gap-y-2">
            <h3 className="text-lg font-semibold">Descubrir</h3>
            <Link href='/' className="text-sm">Buscar partidos</Link>
            <Link href='/categories' className="text-sm">Clubes</Link>
          </div>
          <div className="flex flex-col items-start gap-y-2">
            <h3 className="text-lg font-semibold">Contacta con nosotros</h3>
            <Link href='/refunds' className="text-sm">Política de Reembolsos</Link>
            <Atention/>
          </div>
        </article>
      </div>
      <div className="flex flex-col md:flex-row justify-start gap-4 items-start md:items-center w-full">
        <Link href='/privacy' className="text-sm underline " > Políticas de privacidad </Link>
        <Link href='/terms' className="text-sm underline " > Términos y condiciones </Link>
        <Link href='/faq' className="text-sm underline " > Preguntas frecuentes </Link>
      </div>
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center w-full">
        <div className="flex flex-col md:flex-row justify-start gap-4 items-start md:items-center ">
          <p className=" text-xs text-primary">Copyright© 2025. Todos los derechos reservados.</p>
          <p className="text-xs text-primary">La venta de entradas esta verificada por los entes deportivos de Argentina.</p>
        </div>
        <div className="flex items-start md:items-center gap-4">
          <Link href='https://www.instagram.com/laligabasquet' target='_blank'>
            <Image src='/logos/instagram.svg' width={20} height={20} alt="Instagram" />
          </Link>
          <Link href='https://www.facebook.com/lnboficial' target='_blank'>
            <Image src='/logos/facebook.svg' width={20} height={20} alt="facebook" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
