'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Ticket } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EventStepIndicator } from '@/components/dashboard/events/event-step-indicator';
import { EventInfoStep } from '@/app/dashboard/events/new/event-info-step';
import { EventSummaryStep } from '@/app/dashboard/events/new/event-summary-step';
import { StandDetail } from '@/lib/types';
import { EventLogisticsStep } from '@/app/dashboard/events/new/event-logistics-step';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEvents } from '@/contexts/events-context';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { parseCustomDateString } from '@/lib/utils';
import { isBefore } from 'date-fns';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { BlockLoader } from '@/components/shared/block-loader';

export const dynamic = 'force-dynamic';

export type EventFormData = {
  eventName: string;
  eventDescription: string;
  address: any;
  image: File | null;
  flyerUrl?: string; // To hold existing image URL
  dateInit: Date | null;
  dateEnd: Date | null;
  includesMembers: boolean;
  includeStadium: boolean;
  stadiumId: string | null;
  standDetails: StandDetail[];
};

export default function NewEventPage() {
  return (
    <Suspense fallback={<div className="p-4">Cargando...</div>}>
      <NewEventPageInner />
    </Suspense>
  );
}

function NewEventPageInner() {
  const [currentStep, setCurrentStep] = useState(0);
  const { createEvent, updateEvent, getEventById, loading } = useEvents();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id');
  const storeId = searchParams.get('storeId');
  const isEditing = !!eventId;
  const [isSubmiting, setIsSubmiting] = useState(false)
  const [formData, setFormData] = useState<EventFormData>({
    eventName: '',
    eventDescription: '',
    address: { description: '', place_id: '' },
    image: null,
    flyerUrl: '',
    dateInit: new Date(),
    dateEnd: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // Default to 2 hours later
    includesMembers: false,
    includeStadium: false,
    stadiumId: null,
    standDetails: [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      const fetchEventData = async () => {
        const eventData = await getEventById(eventId);
        if (eventData) {
          setFormData({
            eventName: eventData.name || '',
            eventDescription: eventData.description || '',
            address: typeof eventData.address === 'string'
              ? { description: eventData.address, place_id: '' }
              : (eventData.address || { description: '', place_id: '' }),
            image: null, // Image file is handled separately
            flyerUrl: eventData.flyer,
            dateInit: eventData.startDate ? (parseCustomDateString(eventData.startDate) || new Date(eventData.startDate)) : new Date(),
            dateEnd: eventData.endDate ? (parseCustomDateString(eventData.endDate) || new Date(eventData.endDate)) : new Date(),
            includesMembers: eventData.subscribersEnabled || false,
            includeStadium: !!eventData.stadium?.id,
            stadiumId: eventData.stadium?.id || null,
            standDetails: eventData.stadium?.layout || [],
          });
        } else {
          toast.error('No se pudo cargar la información del evento para editar.');
          router.push('/dashboard/events');
        }
      };
      fetchEventData();
    }
  }, [eventId, isEditing, getEventById, router]);


  const steps = [
    { id: '01', name: 'Información Básica' },
    { id: '02', name: 'Logística y Configuración' },
    { id: '03', name: 'Resumen' },
  ];

  const validateImageDimensions = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        setImageError("El archivo no es una imagen válida.");
        resolve(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const image = new window.Image();
        image.src = e.target?.result as string;
        image.onload = () => {
          const aspectRatio = image.width / image.height;
          const targetAspectRatio = 900 / 500;
          // Permitimos un pequeño margen de error
          if (Math.abs(aspectRatio - targetAspectRatio) < 0.01) {
            setImageError(null);
            resolve(true);
          } else {
            setImageError("La imagen debe tener una relación de aspecto de 9:5 (Ej: 900x500px).");
            resolve(false);
          }
        };
        image.onerror = () => {
          setImageError("No se pudo cargar la imagen para validarla.");
          resolve(false);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    if (formData.image) {
      validateImageDimensions(formData.image);
    } else {
      setImageError(null);
    }
  }, [formData.image]);


  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (step === 0) {
      if (!formData.eventName) newErrors.eventName = "El nombre es requerido.";
      if (!formData.eventDescription) newErrors.eventDescription = "La descripción es requerida.";
      if (!formData.image && !formData.flyerUrl) newErrors.image = "La imagen es requerida.";
      if (imageError) newErrors.image = imageError;
    }
    if (step === 1) {
      if (!formData.address?.description) newErrors.address = "La dirección es requerida.";
      if (!formData.dateInit) newErrors.dateInit = "La fecha de inicio es requerida.";
      if (formData.dateInit && isBefore(formData.dateInit, new Date())) {
        newErrors.dateInit = "La fecha de inicio no puede ser anterior a la actual.";
      }
      if (!formData.dateEnd) newErrors.dateEnd = "La fecha de fin es requerida.";
      if (formData.dateInit && formData.dateEnd && isBefore(formData.dateEnd, formData.dateInit)) {
        newErrors.dateEnd = "La fecha de fin no puede ser anterior a la de inicio.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => s + 1);
    }
  }
  const prevStep = () => setCurrentStep((s) => s - 1);

  const updateFormData = useCallback((newData: Partial<EventFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  }, []);

  const handleSubmit = async () => {
    if (validateStep(0) && validateStep(1)) {
      if (isEditing) {
        setIsSubmiting(true)
        const updatedEvent = await updateEvent(eventId, formData);
        setIsSubmiting(false)
        if (updatedEvent) router.push('/dashboard/events');
      } else {
        if (!storeId) {
          toast.error('No se ha seleccionado un club para crear el evento.');
          return;
        }
        setIsSubmiting(true)
        const newEvent = await createEvent(storeId, formData);
        setIsSubmiting(false)
        if (newEvent) router.push('/dashboard/events');
      }
    } else {
      toast.error("Por favor, completa todos los campos requeridos antes de guardar.");
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 0) {
      return !formData.eventName || !formData.eventDescription || (!formData.image && !formData.flyerUrl) || !!imageError;
    }
    if (currentStep === 1) {
      return !formData.address?.description || !formData.dateInit || !formData.dateEnd || isBefore(formData.dateEnd, formData.dateInit) || isBefore(formData.dateInit, new Date());
    }
    return false;
  }

  return (
    <>
      <div className="md:container mx-auto">
        <div className="mb-2">
          <Link
            href="/dashboard/events"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Partidos
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <EventStepIndicator steps={steps} currentStep={currentStep} />
          </div>

          <div className="lg:col-span-2">
            <Card className='border-none bg-light text-primary shadow-xl'>
              <CardHeader>
                <CardTitle className="text-2xl font-headline">{isEditing ? 'Editar Partido' : steps[currentStep].name}</CardTitle>
              </CardHeader>
              <CardContent>
                {currentStep === 0 && (
                  <EventInfoStep formData={formData} updateFormData={updateFormData} imageError={imageError} />
                )}
                {currentStep === 1 && (
                  <EventLogisticsStep formData={formData} updateFormData={updateFormData} isEditing={isEditing} errors={errors} />
                )}
                {currentStep === 2 && <EventSummaryStep formData={formData} />}

                <div className="mt-8 flex justify-end gap-4">
                  {currentStep > 0 && (
                    <Button variant="outline" onClick={prevStep} disabled={loading}>
                      Volver
                    </Button>
                  )}
                  {currentStep < steps.length - 1 ? (
                    <Button onClick={nextStep} disabled={loading || isNextDisabled()}>
                      Siguiente
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={loading}>
                      {loading && <Spinner size="sm" className="mr-2" />}
                      <Ticket className="mr-2 h-4 w-4" />
                      {isEditing ? 'Actualizar Partido' : 'Crear Partido'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Dialog open={isSubmiting} onOpenChange={() => setIsSubmiting(true)}>
        <DialogTitle className="hidden"></DialogTitle>
        <DialogContent className="max-w-xs sm:max-w-sm px-4 py-10 rounded-lg border-none bg-dark">
          <BlockLoader messages={['Generando mapa del estadio', 'Creando tribunas', 'Generando asientos']} />
        </DialogContent>
      </Dialog>
    </>
  );
}
