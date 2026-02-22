'use client';
import { useUser } from "@/contexts/user-context";
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from "react";
import { toast } from "sonner";

export default function MyTicketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logged, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname()
  const searchParams = useSearchParams()


  const getCurrentPathWithQueryAndHash = () => {
    const sp = searchParams.toString();
    const hash = window.location.hash || "";
    const back = `${pathname}${sp ? `?${sp}` : ""}${hash}`;
    return back
  }


  useEffect(() => {
    if (!loading && !logged) {
      toast.info("Debes iniciar sesión para ver tus tickets.");
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('postLoginRedirect', getCurrentPathWithQueryAndHash())
        }
      } catch { }
      router.push('/login')
    }
  }, [loading, logged, router]);

  if (loading || !logged) {
    return (
      <section className="flex-1 flex flex-col items-start p-8 md:p-20 gap-y-4 w-full min-h-[60vh]">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-9 h-9 border-4 border-t-4 border-t-transparent border-primary rounded-full animate-spin"></div>
        </div>
      </section>
    )
  }

  return <>{children}</>;
}
