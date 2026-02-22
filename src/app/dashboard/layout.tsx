"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { AccessesProvider } from "@/contexts/accesses-context";
import { CarouselsProvider } from "@/contexts/carousels-context";
import { EventsProvider } from "@/contexts/events-context";
import { ListsProvider } from "@/contexts/lists-context";
import { StadiumsProvider } from "@/contexts/stadiums-context";
import { StoresProvider } from "@/contexts/stores-context";
import { TransactionsProvider } from "@/contexts/transactions-context";
import { RRPPProvider } from "@/contexts/rrpp-context";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  const [authReady, setAuthReady] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setRedirecting(true);
      router.replace("/");
      return;
    }

    const hasAccess =
      user.role && user.role !== "cliente" && user.role !== "rrpp";
    if (!hasAccess) {
      setRedirecting(true);
      router.replace("/");
      return;
    }

    setAuthReady(true);
  }, [user, loading, router]);

  if (!authReady || redirecting) {
    return (
      <div
        className="flex h-screen w-full items-center justify-center"
        translate="no"
      >
        <p translate="no">Cargando…</p>
      </div>
    );
  }

  return (
    <div translate="no" className="notranslate">
      <StoresProvider>
        <CarouselsProvider>
          <StadiumsProvider>
            <EventsProvider>
              <TransactionsProvider>
                <AccessesProvider>
                  <ListsProvider>
                    <RRPPProvider>
                      {/* CLAVE: el scroller ÚNICO del dashboard */}
                      <div
                        id="dashboard-scroll"
                        className="flex h-screen w-full flex-col overflow-y-auto"
                      >
                        <DashboardHeader />

                        {/* CLAVE: min-h-0 para que el flex child no rompa el overflow */}
                        <main className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 z-30 bg-background">
                          {children}
                        </main>
                      </div>
                    </RRPPProvider>
                  </ListsProvider>
                </AccessesProvider>
              </TransactionsProvider>
            </EventsProvider>
          </StadiumsProvider>
        </CarouselsProvider>
      </StoresProvider>
    </div>
  );
}
