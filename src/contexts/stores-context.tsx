
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { useUser } from './user-context';

const entorno = process.env.NEXT_PUBLIC_ENTORNO;
const API_BASE_URL =
  entorno === "develop"
    ? process.env.NEXT_PUBLIC_API_DEV_URL
    : process.env.NEXT_PUBLIC_API_URL;

const credentialsOption: RequestCredentials =
  entorno !== "develop" ? "include" : "omit";

const APP_BRAND_ID = "e1fdc3f4-2ab8-4b34-a61a-38837337d946";

interface Store {
    id: string;
    name: string;
    [key: string]: any;
}

interface Category {
    id: string;
    name: string;
    logoUrl?: string;
}

interface StoresContextType {
    stores: Store[];
    categories: Category[];
    loading: boolean;
    selectedClub: string;
    setSelectedClub: React.Dispatch<React.SetStateAction<string>>;
    displayStores: Store[];
    canUserManageMultipleStores: boolean;
    getStores: (params?: { enabled?: boolean; deleted?: string }) => Promise<void>;
    getStoreById: (sid: string) => Promise<Store | null>;
    createStore: (payload: any) => Promise<Store | null>;
    updateStore: (sid: string, data: any, logoFile?: File | null) => Promise<Store | null>;
    deleteStore: (sid: string) => Promise<void>;
    getCategories: () => Promise<void>;
    getCategoryById: (cid: string) => Promise<Category | null>;
    createCategory: (name: string, logoFile?: File | null) => Promise<Category | null>;
    updateCategory: (cid: string, name: string, logoFile?: File | null) => Promise<Category | null>;
    deleteCategory: (cid: string) => Promise<void>;
    updateBrandBanner: (file: File) => Promise<any | null>;
    deleteBrandBanner: () => Promise<boolean>;
    getBrandBannerUrl: () => Promise<string>;
    updateStoreBanner: (storeId: string, file: File) => Promise<any | null>;
    deleteStoreBanner: (storeId: string) => Promise<boolean>;
}

const StoresContext = createContext<StoresContextType | undefined>(undefined);

export const StoresProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useUser();
    const [stores, setStores] = useState<Store[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedClub, setSelectedClub] = useState<string>("all");

    const getStores = useCallback(async (params?: { enabled?: boolean; deleted?: string }) => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (params?.enabled) query.append("enabled", "true");
            if (params?.deleted) query.append("deleted", params.deleted);
            const res = await fetch(`${API_BASE_URL}/stores?${query.toString()}`, { credentials: credentialsOption });
            if (!res.ok) throw new Error("Error obteniendo los clubes");
            const data = await res.json();
            setStores(data);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const displayStores = useMemo(() => {
        if (!user) return [];
        const userRole = user.role as string;
        if (userRole && ['super-admin', 'admin'].includes(userRole)) {
            return stores;
        } else {
            const userStoreIds = (user.stores as any[])?.map(s => typeof s === 'object' ? s.id : s) || [];
            return stores.filter(store => userStoreIds.includes(store.id));
        }
    }, [user, stores]);
    
    const canUserManageMultipleStores = useMemo(() => {
        if (!user) return false;
        const userRole = user.role as string;
        return ['super-admin', 'admin'].includes(userRole) || (displayStores.length > 1);
    }, [user, displayStores]);
    
       useEffect(() => {
        if (!user) return;

        // Si solo tiene una tienda → set automático
        if (!canUserManageMultipleStores && displayStores.length === 1) {
            setSelectedClub(displayStores[0].id);
        }

        // Si es admin → “all”
        if (canUserManageMultipleStores) {
            setSelectedClub("all");
        }
    }, [user, canUserManageMultipleStores, displayStores]);

    const getStoreById = useCallback(async (sid: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/stores/${sid}`, { credentials: credentialsOption });
            if (!res.ok) throw new Error("Club no encontrado");
            const storeData = await res.json();
            return storeData;
        } catch (error: any) {
            toast.error(error.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createStore = useCallback(async (payload: any) => {
        setLoading(true);
        try {
            let options: RequestInit;
            const { logoFile, ...rest } = payload;

            if (logoFile) {
                const form = new FormData();
                Object.keys(rest).forEach(key => form.append(key, rest[key]));
                form.append("file", logoFile);
                options = { method: "POST", body: form, credentials: credentialsOption };
            } else {
                options = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(rest),
                    credentials: credentialsOption,
                };
            }
            const res = await fetch(`${API_BASE_URL}/stores`, options);
            if (!res.ok) {
                 if (res.status === 409) {
                    throw new Error("Email o CUIT duplicado");
                 }
                 const errorData = await res.json();
                 throw new Error(errorData.message || "Error creando club");
            }
            const newStore = await res.json();
            toast.success("Club creado con éxito");
            setStores(prev => [...prev, newStore]);
            return newStore;
        } catch (error: any) {
            toast.error(error.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStore = useCallback(async (sid: string, data: any, logoFile?: File | null) => {
        setLoading(true);
        try {
            let options: RequestInit;
            
            if (logoFile) {
                const form = new FormData();
                Object.entries(data).forEach(([k, v]) => {
                    if (v !== null && v !== undefined) {
                        form.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
                    }
                });
                form.append("file", logoFile);
                options = { method: "PUT", body: form, credentials: credentialsOption };
            } else {
                 options = {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                    credentials: credentialsOption,
                };
            }

            const res = await fetch(`${API_BASE_URL}/stores/${sid}`, options);
             if (!res.ok) {
                 const errorData = await res.json();
                 throw new Error(errorData.message || "Error actualizando club");
            }
            toast.success("Club actualizado con éxito");
            const updatedStore = await res.json();
            setStores(prevStores => 
                prevStores.map(store => 
                    store.id === sid ? { ...store, ...updatedStore } : store
                )
            );
            return updatedStore;
        } catch (error: any) {
            toast.error(error.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteStore = useCallback(async (sid: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/stores/${sid}`, { method: "DELETE", credentials: credentialsOption });
            if (!res.ok) throw new Error("Error eliminando club");
            toast.success("Club eliminado con éxito");
            setStores(prev => prev.filter(s => s.id !== sid));
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const getCategories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/stores/categories`, { credentials: credentialsOption });
            if (!res.ok) throw new Error("Error obteniendo categorías");
            const data = await res.json();
            setCategories(data);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const getCategoryById = useCallback(async (cid: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/stores/categories/${cid}`, { credentials: credentialsOption });
            if (!res.ok) throw new Error("Categoría no encontrada");
            return res.json();
        } catch (error: any) {
            toast.error(error.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createCategory = useCallback(async (name: string, logoFile?: File | null) => {
        setLoading(true);
        try {
            let options: RequestInit;
            if (logoFile) {
                const form = new FormData();
                form.append("name", name);
                form.append("file", logoFile);
                options = { method: "POST", body: form, credentials: credentialsOption };
            } else {
                options = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name }),
                    credentials: credentialsOption,
                };
            }
            const res = await fetch(`${API_BASE_URL}/stores/categories`, options);
            if (!res.ok) throw new Error("Error creando categoría");
            const newCategory = await res.json();
            toast.success("Categoría creada con éxito");
            setCategories(prev => [...prev, newCategory]);
            return newCategory;
        } catch (error: any) {
            toast.error(error.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateCategory = useCallback(async (cid: string, name: string, logoFile?: File | null) => {
        setLoading(true);
        try {
            let options: RequestInit;
            if (logoFile) {
                const form = new FormData();
                form.append("name", name);
                form.append("file", logoFile);
                options = { method: "PUT", body: form, credentials: credentialsOption };
            } else {
                options = {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name }),
                    credentials: credentialsOption,
                };
            }
            const res = await fetch(`${API_BASE_URL}/stores/categories/${cid}`, options);
            if (!res.ok) throw new Error("Error actualizando categoría");
            const updatedCategory = await res.json();
            toast.success("Categoría actualizada con éxito");
            setCategories(prev => prev.map(c => c.id === cid ? updatedCategory : c));
            return updatedCategory;
        } catch (error: any) {
            toast.error(error.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteCategory = useCallback(async (cid: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/stores/categories/${cid}`, { method: "DELETE", credentials: credentialsOption });
            if (!res.ok) throw new Error("Error eliminando categoría");
            toast.success("Categoría eliminada con éxito");
            setCategories(prev => prev.filter(c => c.id !== cid));
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, []);
    
    const updateBrandBanner = useCallback(async (file: File) => {
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch(`${API_BASE_URL}/brands/${APP_BRAND_ID}/banner`, {
                method: "PUT",
                body: fd,
                credentials: credentialsOption,
            });
            if (!res.ok) throw new Error("No se pudo actualizar el banner de la brand");
            toast.success('Banner de la aplicación actualizado.');
            return res.json();
        } catch (error: any) {
            toast.error(error.message || 'Error al actualizar el banner.');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteBrandBanner = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/brands/${APP_BRAND_ID}/banner?deleted=true`, {
                method: "PUT",
                credentials: credentialsOption,
            });
            if (!res.ok) throw new Error("No se pudo eliminar el banner de la brand");
            toast.success('Banner de la aplicación eliminado.');
            return true;
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar el banner.');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);
    
    const getBrandBannerUrl = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/brands`, { credentials: credentialsOption });
            if (!res.ok) throw new Error("No se pudo obtener las brands");
            const list = await res.json();
            const appBrand = list.find((b: any) => b.id === APP_BRAND_ID);
            return appBrand?.advertisingBanner || "";
        } catch (error: any) {
            toast.error(error.message || 'Error al obtener el banner.');
            return "";
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStoreBanner = useCallback(async (storeId: string, file: File) => {
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch(`${API_BASE_URL}/stores/${storeId}/banner`, {
                method: "PUT",
                body: fd,
                credentials: credentialsOption,
            });
            if (!res.ok) throw new Error("No se pudo actualizar el banner del club");
            const updatedStore = await res.json();
            toast.success('Banner del club actualizado.');
            setStores(prev => prev.map(s => s.id === storeId ? { ...s, ...updatedStore } : s));
            return updatedStore;
        } catch (error: any) {
            toast.error(error.message || 'Error al actualizar el banner del club.');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteStoreBanner = useCallback(async (storeId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/stores/${storeId}/banner?deleted=true`, {
                method: 'PUT',
                credentials: credentialsOption,
            });
            if (!res.ok) throw new Error("No se pudo eliminar el banner del club");
            toast.success('Banner del club eliminado.');
            return true;
        } catch(e: any) {
            toast.error(e.message || 'Error al eliminar el banner del club.');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const value = {
        stores,
        categories,
        loading,
        getStores,
        getStoreById,
        createStore,
        updateStore,
        deleteStore,
        getCategories,
        getCategoryById,
        createCategory,
        updateCategory,
        deleteCategory,
        selectedClub,
        setSelectedClub,
        displayStores,
        canUserManageMultipleStores,
        updateBrandBanner,
        deleteBrandBanner,
        getBrandBannerUrl,
        updateStoreBanner,
        deleteStoreBanner
    };

    return <StoresContext.Provider value={value}>{children}</StoresContext.Provider>;
};

export const useStores = () => {
    const context = useContext(StoresContext);
    if (context === undefined) {
        throw new Error('useStores must be used within a StoresProvider');
    }
    return context;
};
