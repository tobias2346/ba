

'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { toast } from 'sonner';
import { StadiumFormData } from '@/app/dashboard/stadiums/new/page';
import { StandDetail } from '@/lib/types';

const entorno = process.env.NEXT_PUBLIC_ENTORNO;
const API_BASE_URL =
  entorno === "develop"
    ? process.env.NEXT_PUBLIC_API_DEV_URL
    : process.env.NEXT_PUBLIC_API_URL;

const credentialsOption: RequestCredentials =
  entorno !== "develop" ? "include" : "omit";


interface Stadium {
    id: string;
    name: string;
    type: 'numerated' | 'sectorized';
    stands: StandDetail[];
    sectors: { id: string; name: string }[];
    [key: string]: any;
}


interface StadiumsContextType {
    stadiums: Stadium[];
    loading: boolean;
    getStadiums: (storeId?: string | null, type?: 'numerated' | 'sectorized') => Promise<void>;
    getStadiumById: (stadiumId: string) => Promise<Stadium | null>;
    createStadium: (stadiumData: StadiumFormData, storeId: string) => Promise<boolean>;
    updateStadium: (stadiumId: string, stadiumData: StadiumFormData) => Promise<boolean>;
    deleteStadium: (stadiumId: string) => Promise<void>;
}

const StadiumsContext = createContext<StadiumsContextType | undefined>(undefined);

export const StadiumsProvider = ({ children }: { children: ReactNode }) => {
    const [stadiums, setStadiums] = useState<Stadium[]>([]);
    const [loading, setLoading] = useState(false);

    const getStadiums = useCallback(async (storeId?: string | null, type?: 'numerated' | 'sectorized') => {
        setLoading(true);
        try {
            const url = new URL(`${API_BASE_URL}/stadiums`);
            if (storeId && storeId !== 'all') {
                url.searchParams.append('storeId', storeId);
            }
             if (type) {
                url.searchParams.append('type', type);
            }
            const res = await fetch(url.toString(), { credentials: credentialsOption });
            if (!res.ok) throw new Error("Error obteniendo los estadios");
            const data = await res.json();
            setStadiums(data.docs || data || []);
        } catch (error: any) {
            toast.error(error.message);
            setStadiums([]);
        } finally {
            setLoading(false);
        }
    }, []);
    
    const getStadiumById = useCallback(async (stadiumId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/stadiums/${stadiumId}`, {credentials: credentialsOption});
            if (!res.ok) throw new Error("Estadio no encontrado");
            return res.json();
        } catch (error: any) {
            toast.error(error.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createStadium = useCallback(async (stadiumData: StadiumFormData, storeId: string) => {
        setLoading(true);
        try {
            const payload: any = {
              name: stadiumData.stadiumName,
              type: stadiumData.segmentationType,
              storeId: storeId,
            };

            if (stadiumData.segmentationType === 'numerated') {
                payload.stands = stadiumData.standDetails.map(stand => ({
                    ...stand,
                    bandeja: stand.type, // Map type to bandeja for backend
                }));
            } else { // sectorized
                payload.sectors = stadiumData.sectors;
            }
            
            const fd = new FormData();
            if (stadiumData.sectorMapImage) {
              fd.append("file", stadiumData.sectorMapImage);
            }

            for (const [k, v] of Object.entries(payload)) {
              if (v !== undefined && v !== null) {
                fd.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
              }
            }
            
            const res = await fetch(`${API_BASE_URL}/stadiums`, {
                method: "POST",
                body: fd,
                credentials: credentialsOption
            });

            if (!res.ok) {
                 const errorData = await res.json();
                 throw new Error(errorData.message || "Error creando el estadio");
            }

            await getStadiums(storeId);
            toast.success('Estadio creado con éxito');
            return true;
        } catch (error: any) {
            toast.error(error.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [getStadiums]);

    const updateStadium = useCallback(async (stadiumId: string, stadiumData: StadiumFormData) => {
        setLoading(true);
        try {
            const payload: any = {
                name: stadiumData.stadiumName,
            };
            if(stadiumData.segmentationType === 'numerated') {
                payload.stands = stadiumData.standDetails;
            } else {
                payload.sectors = stadiumData.sectors;
            }

            let response;
            if(stadiumData.sectorMapImage) {
                 const fd = new FormData();
                if (stadiumData.sectorMapImage) fd.append("file", stadiumData.sectorMapImage);
                for (const [k, v] of Object.entries(payload)) {
                    fd.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
                }
                response = await fetch(`${API_BASE_URL}/stadiums/${stadiumId}`, { method: "PUT", body: fd, credentials: credentialsOption });
            } else {
                response = await fetch(`${API_BASE_URL}/stadiums/${stadiumId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                    credentials: credentialsOption
                });
            }

            if (!response.ok) {
                 const errorData = await response.json();
                 if (errorData.error === "No se puede editar un estadio con un evento en curso") {
                     throw new Error("No se puede editar un estadio con un evento a desarrollarse allí");
                 }
                 throw new Error(errorData.message || "Error actualizando el estadio");
            }
            toast.success("Estadio actualizado con éxito");
            return true;
        } catch (error: any) {
            toast.error(error.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [])

    const deleteStadium = useCallback(async (stadiumId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/stadiums/${stadiumId}`, { 
                method: 'DELETE',
                credentials: credentialsOption 
            });
            if(!res.ok) throw new Error("Error eliminando el estadio");
            setStadiums(prev => prev.filter(s => s.id !== stadiumId));
            toast.success("Estadio eliminado con éxito");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, [])

    const value = {
        stadiums,
        loading,
        getStadiums,
        getStadiumById,
        createStadium,
        updateStadium,
        deleteStadium,
    };

    return <StadiumsContext.Provider value={value}>{children}</StadiumsContext.Provider>;
};

export const useStadiums = () => {
    const context = useContext(StadiumsContext);
    if (context === undefined) {
        throw new Error('useStadiums must be used within a StadiumsProvider');
    }
    return context;
};
