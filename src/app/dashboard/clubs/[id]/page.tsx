
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ClubHeader } from '@/components/dashboard/clubs/club-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfigGeneralStep } from '@/components/dashboard/clubs/config-general-step';
import { ConfigPaymentStep } from '@/components/dashboard/clubs/config-payment-step';
import { ConfigPercentagesStep } from '@/components/dashboard/clubs/config-percentages-step';
import { ConfigAccessControlStep } from '@/components/dashboard/clubs/config-access-control-step';
import { useStores } from '@/contexts/stores-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import { useUser } from '@/contexts/user-context';

export default function ClubDetailPage() {
  const params = useParams();
  const clubId = params.id as string;
  const { getStoreById, updateStore } = useStores();
  const { user } = useUser();
  const [clubData, setClubData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchClub = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    const data = await getStoreById(clubId);
    if (data) {
      setClubData(data);
    } else {
      router.push('/dashboard/clubs');
    }
    setLoading(false);
  }, [clubId, getStoreById, router]);

  useEffect(() => {
    fetchClub();
  }, [fetchClub]);

  const handleUpdate = useCallback(async (dataToUpdate: any, logoFile?: File | null, bannerFile?: File | null) => {
    const payload = {
      ...dataToUpdate,
      address: dataToUpdate.address
    }
    const updatedStore = await updateStore(clubId, payload, logoFile, bannerFile);
    if (updatedStore) {
      setClubData(updatedStore);
    }
    return updatedStore;
  }, [clubId, updateStore]);


  if (loading || !clubData) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-1/4" />
        <Skeleton className="h-20 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-11/12 md:container mx-auto py-8 space-y-6">
      <ClubHeader
        clubName={clubData.name}
        clubLogo={clubData.logo}
        clubEmail={clubData.email}
      />

      <Tabs defaultValue="general">
        {/* HEADER DE TABS */}
        <div className="relative">
          <TabsList
            className="w-80 md:w-full flex flex-nowrap items-center justify-start overflow-x-auto overflow-y-hidden gap-2 p-1 md:justify-start scrollbar-hide "
          >
            <TabsTrigger
              className="bg-secondary/40 py-2 whitespace-nowrap"
              value="general"
            >
              Configuración General
            </TabsTrigger>

            {user?.role === 'super-admin' && (
              <TabsTrigger
                className="bg-secondary/40 py-2 whitespace-nowrap"
                value="payment"
              >
                Plataforma de Pago
              </TabsTrigger>
            )}

            {user?.role?.includes('admin') && (
              <TabsTrigger
                className="bg-secondary/40 py-2 whitespace-nowrap"
                value="percentages"
              >
                Costo de Servicio
              </TabsTrigger>
            )}

            <TabsTrigger
              className="bg-secondary/40 py-2 whitespace-nowrap"
              value="access-control"
            >
              Control de Acceso
            </TabsTrigger>
          </TabsList>
        </div>

        {/* CONTENIDO */}
        <TabsContent value="general">
          <ConfigGeneralStep clubData={clubData} onUpdate={handleUpdate} />
        </TabsContent>

        {user?.role === 'super-admin' && (
          <TabsContent value="payment">
            <ConfigPaymentStep clubData={clubData} onUpdate={handleUpdate} />
          </TabsContent>
        )}

        <TabsContent value="percentages">
          <ConfigPercentagesStep clubData={clubData} onUpdate={handleUpdate} />
        </TabsContent>

        <TabsContent value="access-control">
          <ConfigAccessControlStep clubData={clubData} onUpdate={handleUpdate} />
        </TabsContent>
      </Tabs>
    </div>

  );
}
