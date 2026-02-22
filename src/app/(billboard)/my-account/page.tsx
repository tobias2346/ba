'use client'
import ContactModal from "@/components/shared/contact-modal";
import modalFeedbackReact from "@/components/shared/feedback-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/contexts/user-context";
import { Copy, MailCheck, MessageCircle, UserCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function MyAccountPage() {

  const router = useRouter()
  const [open, setOpen] = useState(false);

  const navlinks = [
    { label: "Información personal", href: '/my-account/change-info', alt: 'info', icon: "/icons/user-white.svg" },
    { label: "Actualizar contraseña", href: '/my-account/change-password', alt: 'lock', icon: "/icons/lock.svg" },
    { label: "Legales", href: '/terms', alt: 'file', icon: "/icons/file.svg" }
  ];

  const { user, logged, loading, resendVerificationEmail } = useUser()

  const copyAliasToClipboard = () => {
    const alias = user?.alias as string || '';
    navigator.clipboard.writeText(alias);
    toast.success("Alias copiado");
  };


  const sendVerification = async () => {
    try {
      await resendVerificationEmail(user);

      modalFeedbackReact(
        "Verificación de cuenta pendiente",
        "❗ Si no está en tu casilla principal, revisá Spam y marcá el mensaje como “No es spam”. \n\n👉 Abrí el email y hacé clic en “Verificar cuenta” para habilitar el acceso completo. \n\n🔓 Hasta que verifiques tu cuenta, tu acceso será limitado y algunas funciones no estarán disponibles.",
        "warning",
        true
      );
      toast.success("Mail de verificación enviado con éxito")
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!logged && !loading) router.push('/login')
  }, [loading])

  return (
    <section className="w-full flex-1 flex flex-col items-start px-8 py-8 md:px-[10vw] md:py-14 gap-y-4">
      <h4 className=" text-2xl md:text-3xl font-semibold font-headline">Mi cuenta</h4>
      <div className="w-full md:max-w-lg mx-auto space-y-8">
        <Card className="bg-transparent border-none md:bg-dark md:p-4 space-y-4">
          <div className="w-full h-28 flex items-center gap-4">
            <Avatar className="h-28 w-28">
              <AvatarImage src={user?.photo as string} alt={user?.name as string} />
              <AvatarFallback>
                <UserCircle className="h-full w-full text-primary" />
              </AvatarFallback>
            </Avatar>
            <h5 className="font-semibold font-headline text-2xl text-light"> {user?.name} </h5>
          </div>
          <CardContent className="w-full flex flex-col gap-y-2 p-2 md:p-4">
            <h4 className="text-sm font-headline">Alias</h4>
            <div className="flex items-center justify-between gap-2 bg-background px-2 md:px-5 py-2 rounded-md mb-2">
              <p className="font-mono text-light">{user?.alias as string || 'BasquetID.example'}</p>
              <Button variant="ghost" size="icon" onClick={copyAliasToClipboard} className="h-7 w-7">
                <Copy className="text-primary" />
              </Button>
            </div>
            {
              navlinks.map(link => <Link href={link.href} key={link.href} className="w-full h-10 border-b border-slate-600 flex items-center gap-4 text-slate-300 hover:text-primary">
                <Image src={link.icon} alt={link.alt} width={18} height={18} />
                <h4 className="font-medium font-headline">{link.label}</h4>
              </Link>)
            }
            <button onClick={() => setOpen(true)} type="button" className="w-full h-10 border-b border-slate-600 flex items-center gap-4 text-slate-300 hover:text-primary">
              <Image src='/icons/settings.svg' alt='soporte' width={18} height={18} />
              <h4 className="font-medium font-headline">Soporte</h4>
            </button>
            <button onClick={sendVerification} type="button" className="w-full h-10 border-b border-slate-600 flex items-center gap-4 text-slate-300 hover:text-primary">
              <MailCheck width={20} height={20} />
              <h4 className="font-medium font-headline">Reenviar verificación</h4>
            </button>
          </CardContent>
        </Card>
      </div>
      <ContactModal setOpen={setOpen} open={open} preSelected="Soporte" />
    </section>
  );
}
