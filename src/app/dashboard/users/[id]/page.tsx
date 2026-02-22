
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Construction, UserCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserLike } from '@/contexts/user-context';

function DetailItem({ label, value }: { label: string, value: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="grid grid-cols-3 gap-4">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm col-span-2">{value}</dd>
    </div>
  );
}

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getUserById } = useUser();

  const [userDetail, setUserDetail] = useState<UserLike | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id === 'string') {
      setLoading(true);
      getUserById(id)
        .then(data => {
          setUserDetail(data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id, getUserById]);

  if (loading) {
    return <UserDetailSkeleton />;
  }

  if (!userDetail) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <h2 className="text-xl font-semibold">Usuario no encontrado</h2>
        <p className="text-muted-foreground mt-2">No se pudo cargar la información del usuario.</p>
        <Button onClick={() => router.push('/dashboard/users')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Usuarios
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={() => router.push('/dashboard/users')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Usuarios
        </Button>
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={userDetail.photo || ''} alt={userDetail.name || 'User'} />
            <AvatarFallback>
              <UserCircle className="h-full w-full text-primary" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{userDetail.name} {userDetail.lastName}</h1>
            <p className="text-sm text-muted-foreground">{userDetail.alias}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className=' className="w-80 md:w-full flex flex-nowrap items-center justify-start overflow-x-auto overflow-y-hidden gap-2 p-1 md:justify-start scrollbar-hide " '>
          <TabsTrigger value="personal">Información Personal</TabsTrigger>
          <TabsTrigger value="history">Historial de Eventos</TabsTrigger>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
        </TabsList>
        <TabsContent value="personal">
          <Card className='bg-secondary/20 border-none'>
            <CardHeader>
              <CardTitle>Detalles del Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid gap-4">
                <DetailItem label="ID Usuario" value={userDetail.id} />
                <DetailItem label="Email" value={userDetail.email} />
                <DetailItem label="Teléfono" value={userDetail.phone} />
                <DetailItem label="Documento" value={`${userDetail.nationality} ${userDetail.document}`} />
                <DetailItem label="Edad" value={userDetail.age} />
                <DetailItem label="Género" value={userDetail.gender} />
                <DetailItem label="Rol" value={userDetail.role} />
                <DetailItem label="Proveedor" value={userDetail.provider} />
                <DetailItem label="Última Conexión" value={userDetail.lastConnection} />
                <DetailItem label="Fecha Creación" value={userDetail.createdAt} />
                <DetailItem label="Última Actualización" value={userDetail.updatedAt} />
              </dl>
              <Separator />
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Modificar Email</Label>
                  <div className="flex gap-2 mt-1">
                    <Input className='bg-secondary/40 border-none' id="email" defaultValue={userDetail.email || ''} />
                    <Button>Guardar</Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="document">Modificar DNI</Label>
                  <div className="flex gap-2 mt-1">
                    <Input className='bg-secondary/40 border-none' id="document" defaultValue={userDetail.document || ''} />
                    <Button>Guardar</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-6 py-20">
            <div className="flex flex-col items-center gap-4 text-center">
              <Construction className="h-16 w-16 text-muted-foreground" />
              <h3 className="text-2xl font-bold tracking-tight">
                Página en Construcción
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                El historial de eventos del usuario estará disponible aquí próximamente.
              </p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="transactions">
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-6 py-20">
            <div className="flex flex-col items-center gap-4 text-center">
              <Construction className="h-16 w-16 text-muted-foreground" />
              <h3 className="text-2xl font-bold tracking-tight">
                Página en Construcción
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Las transacciones del usuario estarán disponibles aquí próximamente.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


function UserDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-32 mb-4" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
          <Separator />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
