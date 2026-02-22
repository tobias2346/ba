
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTransactions } from '@/contexts/transactions-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Clock, FileText, Package, Landmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

function DetailItem({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className={cn("grid grid-cols-2 gap-4", className)}>
            <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
            <dd className="text-sm">{value}</dd>
        </div>
    );
}

const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (status?.toLowerCase()) {
        case 'approved': return 'default';
        case 'pending': return 'secondary';
        case 'rejected': return 'destructive';
        case 'refunded': case 'cancelled': case 'expired': return 'outline';
        default: return 'outline';
    }
};

const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
        approved: 'Aprobado', pending: 'Pendiente', rejected: 'Rechazado',
        refunded: 'Devuelto', cancelled: 'Cancelado', expired: 'Expirado',
    };
    return statusMap[status?.toLowerCase()] || status;
};

const formatDateSafe = (dateInput: any): string => {
    if (!dateInput) return 'Fecha inválida';
    // Handle both direct ISO strings and the {"$date": "..."} object format
    const dateValue = typeof dateInput === 'object' && dateInput.$date ? dateInput.$date : dateInput;
    const date = new Date(dateValue);
    if (!isValid(date)) return 'Fecha inválida';
    return format(date, "dd/MM/yyyy HH:mm 'hs'", { locale: es });
};


export default function TransactionDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { getTransactionById, loading } = useTransactions();
    const [transaction, setTransaction] = useState<any | null>(null);

    useEffect(() => {
        if (typeof id === 'string') {
            getTransactionById(id).then(setTransaction);
        }
    }, [id, getTransactionById]);

    if (loading) return <TransactionDetailSkeleton />;
    if (!transaction) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-20">
                <h2 className="text-xl font-semibold">Transacción no encontrada</h2>
                <Button onClick={() => router.push('/dashboard/transactions')} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Transacciones
                </Button>
            </div>
        );
    }
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: transaction.payment?.currency || 'ARS',
        }).format(amount);
      }

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" onClick={() => router.push('/dashboard/transactions')} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Transacciones
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Detalle de la Transacción</h1>
                    </div>
                    <Badge variant={getStatusVariant(transaction.status)} className="text-sm">
                        {translateStatus(transaction.status)}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-none bg-secondary/20">
                    <CardHeader>
                        <CardTitle>Información General</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <dl className="grid gap-3">
                            <DetailItem label="ID Pago" value={transaction.paymentId} />
                            <DetailItem label="Proveedor" value={transaction.provider} />
                            <DetailItem label="Club" value={transaction.store?.name} />
                            <DetailItem label="Evento" value={transaction.event?.name} />
                            <DetailItem label="RRPP" value={transaction.rrpp?.name || 'N/A'} />
                            <DetailItem label="Fecha de Creación" value={formatDateSafe(transaction.createdAt)} />
                        </dl>
                        <Separator />
                        <h3 className="font-semibold">Detalle del Pago</h3>
                        <dl className="grid gap-3">
                            <DetailItem label="Moneda" value={transaction.payment?.currency} />
                            <DetailItem label="Subtotal" value={formatCurrency(transaction.subtotal)} />
                            <DetailItem label="Costo de Servicio" value={formatCurrency(transaction.serviceCharge)} />
                            <DetailItem label="Descuento" value={formatCurrency(transaction.discount)} className="text-green-500" />
                            <DetailItem label="Total" value={formatCurrency(transaction.total)} className="font-bold text-lg" />
                        </dl>
                    </CardContent>
                </Card>

                <Card className='border-none bg-secondary/40'>
                    <CardHeader>
                        <CardTitle>Historial</CardTitle>
                        <CardDescription>Eventos de la transacción</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[450px] pr-4">
                            <div className="relative pl-8">
                                <div className="absolute left-3 top-0 h-full w-px bg-border" />
                                <div className="space-y-8">
                                    {transaction.history?.map((event: any, index: number) => {
                                        return (
                                            <div key={index} className="relative flex items-start">
                                                <div className="absolute -left-5 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-4 ring-background">
                                                    <div className="h-2 w-2 rounded-full bg-primary-foreground"/>
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-semibold">{event.note}</p>
                                                    <time className="text-xs text-muted-foreground">
                                                        {formatDateSafe(event.at)}
                                                    </time>
                                                    <p className="text-xs text-muted-foreground">Por: {event.by}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function TransactionDetailSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div>
                <Skeleton className="h-9 w-40 mb-4" />
                <div className="flex justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-full" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
                        </div>
                        <Separator />
                        <Skeleton className="h-5 w-32" />
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
