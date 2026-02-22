

'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SectorMapStep } from '@/components/dashboard/stadiums/sector-map-step';
import { StadiumPreview } from '@/components/dashboard/stadiums/stadium-preview';
import { Sector, StandDetail, RowDetail } from '@/lib/types';
import { useStadiums } from '@/contexts/stadiums-context';
import { Spinner } from '@/components/ui/spinner';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';


export type StadiumFormData = {
  stadiumName: string;
  segmentationType: 'numerated' | 'sectorized' | null;
  standCount: number;
  standDetails: StandDetail[];
  sectorMapImage: File | null;
  sectors: Sector[];
  imageUrl?: string;
};


function NewStadiumPageInner() {
  const { createStadium, updateStadium, getStadiumById, loading } = useStadiums();
  const router = useRouter();
  const searchParams = useSearchParams();
  const stadiumId = searchParams.get('id');
  const storeId = searchParams.get('storeId') as string;
  const isEditing = !!stadiumId;

  const [formData, setFormData] = useState<StadiumFormData>({
    stadiumName: '',
    segmentationType: null,
    standCount: 0,
    standDetails: [],
    sectorMapImage: null,
    sectors: [{ id: "1", name: '', rows: [] }],
    imageUrl: '',
  });

  const [formLoading, setFormLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      const fetchStadiumData = async () => {
        setFormLoading(true);
        const data = await getStadiumById(stadiumId);
        if (data) {
          // FIX: Map `bandeja` property to `type` for each stand
          const mappedStands = (data.stands || []).map((stand: any) => ({
            ...stand,
            type: stand.bandeja || stand.type, // Use 'bandeja' if available, fallback to 'type'
          }));

          setFormData({
            stadiumName: data.name,
            segmentationType: data.type,
            standCount: data.type === 'numerated' ? mappedStands.length : 0,
            standDetails: data.type === 'numerated' ? mappedStands : [],
            sectors: data.type === 'sectorized' ? data.sectors : [{ id: "1", name: '', rows: [] }],
            sectorMapImage: null,
            imageUrl: data.image
          });
        } else {
          router.push('/dashboard/stadiums');
        }
        setFormLoading(false);
      };
      fetchStadiumData();
    }
  }, [stadiumId, isEditing, getStadiumById, router]);


  const updateFormData = useCallback((newData: Partial<StadiumFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  }, []);

  const showStadiumPreview = formData.segmentationType === 'numerated';

  const handleSubmit = async () => {
    let success;
    if (isEditing) {
      success = await updateStadium(stadiumId, formData);
    } else {
      success = await createStadium(formData, storeId);
    }

    if (success) {
      router.push('/dashboard/stadiums');
    }
  };

  const isSubmitDisabled = useMemo(() => {
    if (loading) return true;
    if (!formData.stadiumName || !formData.segmentationType || (isEditing ? false : !storeId)) {
      return true;
    }
    if (formData.segmentationType === 'numerated') {
      if (formData.standDetails.length === 0) return true;
      return formData.standDetails.some(
        stand => !stand.name || !stand.orientation || !stand.type || !stand.sectors || stand.sectors.length === 0 || stand.sectors.some(sector => !sector.name || sector.rows.length === 0)
      );
    }
    if (formData.segmentationType === 'sectorized') {
      if (!formData.sectorMapImage && !formData.imageUrl) return true;
      return formData.sectors.length === 0 || formData.sectors.some(sector => !sector.name);
    }
    return false;
  }, [formData, loading, isEditing, storeId]);


  if (formLoading) {
    const renderSkeleton = () => (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Skeleton className="h-6 w-36" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
    return renderSkeleton();
  }

  return (
    <div className="flex h-[calc(100vh-10rem)]">
      <div className="flex-1 overflow-y-auto soft-scrollbar md:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard/stadiums" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Volver a Estadios
          </Link>
        </div>

        <Card className="lg:col-span-1 border-none bg-secondary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">
              {isEditing ? 'Editar Estadio' : 'Crear Nuevo Estadio'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="stadiumName">Nombre del Estadio*</Label>
              <Input
                className='border-none bg-secondary/40'
                id="stadiumName"
                value={formData.stadiumName}
                onChange={(e) => updateFormData({ stadiumName: e.target.value })}
                placeholder="Ej: La Bombonerita"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Segmentación*</Label>
              <Select onValueChange={(value: 'numerated' | 'sectorized') => updateFormData({ segmentationType: value })} value={formData.segmentationType || undefined} disabled={isEditing}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent className='border-none bg-secondary/40'>
                  <SelectItem value="numerated">Numerado</SelectItem>
                  <SelectItem value="sectorized">Sectorizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.segmentationType && (
              <SectorMapStep formData={formData} updateFormData={updateFormData} />
            )}

            <div className="mt-8 flex justify-end">
              <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
                {loading && <Spinner size="sm" className="mr-2" />}
                <Building className="mr-2 h-4 w-4" />
                {isEditing ? 'Actualizar Estadio' : 'Crear Estadio'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:block w-1/2 p-8">
        {showStadiumPreview && (
          <Card className="h-full flex flex-col border-none bg-secondary/40">
            <CardHeader>
              <CardTitle className='text-lg'>Vista Previa del Estadio</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center ">
              <StadiumPreview standDetails={formData.standDetails} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function NewStadiumPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <NewStadiumPageInner />
    </Suspense>
  )
}
