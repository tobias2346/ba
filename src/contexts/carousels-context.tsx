
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { toast } from 'sonner';

const entorno = process.env.NEXT_PUBLIC_ENTORNO;
const API_BASE_URL =
  entorno === "develop"
    ? process.env.NEXT_PUBLIC_API_DEV_URL
    : process.env.NEXT_PUBLIC_API_URL;

const credentialsOption: RequestCredentials =
  entorno !== "develop" ? "include" : "omit";

interface Carousel {
    id: string;
    name: string;
    active: boolean;
    position: number;
    events: any[];
    [key: string]: any;
}

interface CarouselPayload {
    name: string;
    active: boolean;
    position: number;
}

interface CarouselsContextType {
    carousels: Carousel[];
    loading: boolean;
    getCarousels: () => Promise<void>;
    createCarousel: (payload: CarouselPayload) => Promise<Carousel | null>;
    updateCarousel: (cid: string, data: CarouselPayload) => Promise<Carousel | null>;
    deleteCarousel: (cid: string) => Promise<void>;
}

const CarouselsContext = createContext<CarouselsContextType | undefined>(undefined);

export const CarouselsProvider = ({ children }: { children: ReactNode }) => {
    const [carousels, setCarousels] = useState<Carousel[]>([]);
    const [loading, setLoading] = useState(false);

    const getCarousels = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/carousels`, { credentials: credentialsOption });
            if (!res.ok) throw new Error("Error obteniendo los carruseles");
            const data = await res.json();
            const carouselsData = data.docs || data;
            setCarousels(Array.isArray(carouselsData) ? carouselsData.sort((a,b) => a.position - b.position) : []);
        } catch (error: any) {
            toast.error(error.message);
            setCarousels([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const createCarousel = useCallback(async (payload: CarouselPayload) => {
        setLoading(true);
        try {
            const url = new URL(`${API_BASE_URL}/carousels`);
            const res = await fetch(url.toString(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: credentialsOption
            });
            if (!res.ok) throw new Error("Error creando el carrusel");
            const newCarousel = await res.json();
            toast.success("Carrusel creado con éxito");
            await getCarousels(); // Fetch all to get the correct order
            return newCarousel;
        } catch (error: any) {
            toast.error(error.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [getCarousels]);

    const updateCarousel = useCallback(async (cid: string, data: CarouselPayload) => {
        setLoading(true);
        try {
            const url = new URL(`${API_BASE_URL}/carousels/${cid}`);
            const res = await fetch(url.toString(), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: credentialsOption
            });
            if (!res.ok) throw new Error("Error actualizando el carrusel");
            const updatedCarousel = await res.json();
            toast.success("Carrusel actualizado con éxito");
            await getCarousels(); // Fetch all to get the correct order
            return updatedCarousel;
        } catch (error: any) {
            toast.error(error.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [getCarousels]);

    const deleteCarousel = useCallback(async (cid: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/carousels/${cid}`, {
                method: 'DELETE',
                credentials: credentialsOption
            });
            if (!res.ok) throw new Error("Error eliminando el carrusel");
            toast.success("Carrusel eliminado con éxito");
            setCarousels(prev => prev.filter(c => c.id !== cid));
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const value = {
        carousels,
        loading,
        getCarousels,
        createCarousel,
        updateCarousel,
        deleteCarousel,
    };

    return <CarouselsContext.Provider value={value}>{children}</CarouselsContext.Provider>;
};

export const useCarousels = () => {
    const context = useContext(CarouselsContext);
    if (context === undefined) {
        throw new Error('useCarousels must be used within a CarouselsProvider');
    }
    return context;
};
