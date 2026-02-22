
"use client";

import React, {
  useState,
  createContext,
  useEffect,
  useContext,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useUI } from "./ui-context";
import { toast } from "sonner";
import modalFeedbackReact from "@/components/shared/feedback-modal";

export type UserLike = {
  id?: string;
  role?: string;
  completed?: boolean;
  verificated?: boolean;
  photo?: string;
  blocked?: boolean;
  name?: string;
  lastName?: string;
  email?: string;
  alias?: string;
  document?: string;
  nationality?: string;
  gender?: "M" | "F" | "Other";
  age?: number;
  phone?: string;
  deletedAt?: Date | null;
} & Record<string, unknown>;

interface PaginationInfo {
  totalDocs: number;
  hasNextPage: boolean;
  nextCursor: string | null;
}

interface UserContextType {
  user: UserLike | null;
  users: UserLike[];
  admins: UserLike[];
  logged: boolean;
  loading: boolean;
  actionLoading: boolean;
  usersPagination: PaginationInfo;
  adminsPagination: PaginationInfo;
  loginUser: (credentials: any, from?: "user" | "dashboard") => Promise<void>;
  registerUser: (userData: any) => Promise<any>;
  updateUser: (userData: any) => Promise<any>;
  changeUserPhoto: (formData: FormData) => Promise<boolean>;
  loginWithGoogle: () => void;
  logout: (showNotification?: boolean) => Promise<void>;
  fetchCurrentUser: () => Promise<UserLike | null>;
  fetchUsers: (options?: {
    includeDeleted?: boolean;
    search?: string;
    cursor?: string | null;
  }) => Promise<void>;
  fetchAdmins: (options?: {
    search?: string;
    cursor?: string | null;
  }) => Promise<void>;
  checkAlias: (alias: string) => Promise<boolean>;
  changeUserPassword: (newPass: string) => Promise<boolean>;
  sendRecoveryEmail: (user: UserLike) => Promise<boolean>;
  resendVerificationEmail: (user: UserLike) => Promise<void>;
  blockUser: (user: UserLike) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  changeUserRole: (
    user: UserLike,
    newRole: string,
    stores: string[]
  ) => Promise<boolean>;
  getUserByEmail: (
    email: string,
    isAdmin?: boolean
  ) => Promise<UserLike | null>;
  getUserById: (id: string) => Promise<UserLike | null>;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

const entorno = process.env.NEXT_PUBLIC_ENTORNO;
const API_BASE_URL =
  entorno === "develop"
    ? process.env.NEXT_PUBLIC_API_DEV_URL
    : process.env.NEXT_PUBLIC_API_URL;

const credentialsOption: RequestCredentials =
  entorno !== "develop" ? "include" : "omit";

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserLike | null>(null);
  const [users, setUsers] = useState<UserLike[]>([]);
  const [admins, setAdmins] = useState<UserLike[]>([]);
  const [logged, setLogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const { setIsProfileModalOpen, setIsVerifyModalOpen } = useUI();
  const router = useRouter();

  const [usersPagination, setUsersPagination] = useState<PaginationInfo>({
    totalDocs: 0,
    hasNextPage: true,
    nextCursor: null,
  });
  const [adminsPagination, setAdminsPagination] = useState<PaginationInfo>({
    totalDocs: 0,
    hasNextPage: true,
    nextCursor: null,
  });

  const fetchUsers = useCallback(
    async (
      options: {
        includeDeleted?: boolean;
        search?: string;
        cursor?: string | null;
      } = {}
    ) => {
      if (!options.cursor) {
        setActionLoading(true);
      }

      const url = new URL(`${API_BASE_URL}/users`);
      if (options.includeDeleted) {
        url.searchParams.append("deleted", "include");
      }
      if (options.search) {
        url.searchParams.append("search", options.search);
      }
      if (options.cursor) {
        url.searchParams.append("cursor", encodeURIComponent(options.cursor));
      }

      try {
        const response = await fetch(url.toString(), {
          method: "GET",
          credentials: credentialsOption,
        });
        if (!response.ok) {
          toast.error("Error al cargar usuarios.");
          if (!options.cursor) setUsers([]);
          return;
        }
        const data = await response.json();
        setUsers((prev) =>
          options.cursor ? [...prev, ...data.docs] : data.docs
        );
        setUsersPagination({
          totalDocs: data.totalDocs,
          hasNextPage: data.hasNextPage,
          nextCursor: data.nextCursor,
        });
      } catch (err) {
        toast.error("Error de red al cargar usuarios.");
        if (!options.cursor) setUsers([]);
      } finally {
        if (!options.cursor) {
          setActionLoading(false);
        }
      }
    },
    []
  );

  const fetchAdmins = useCallback(
    async (
      options: {
        search?: string;
        cursor?: string | null;
      } = {}
    ) => {
      if (!options.cursor) {
        setActionLoading(true);
      }

      const url = new URL(`${API_BASE_URL}/users`);
      url.searchParams.append("admins", "true");
      if (options.search) {
        url.searchParams.append("search", options.search);
      }
      if (options.cursor) {
        url.searchParams.append("cursor", encodeURIComponent(options.cursor));
      }

      try {
        const response = await fetch(url.toString(), {
          method: "GET",
          credentials: credentialsOption,
        });
        if (!response.ok) {
          toast.error("Error al cargar administradores.");
          if (!options.cursor) setAdmins([]);
          return;
        }
        const data = await response.json();
        setAdmins((prev) =>
          options.cursor ? [...prev, ...data.docs] : data.docs
        );
        setAdminsPagination({
          totalDocs: data.totalDocs,
          hasNextPage: data.hasNextPage,
          nextCursor: data.nextCursor,
        });
      } catch (err) {
        toast.error("Error de red al cargar administradores.");
        if (!options.cursor) setAdmins([]);
      } finally {
        if (!options.cursor) {
          setActionLoading(false);
        }
      }
    },
    []
  );

  const fetchCurrentUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/current`, {
        method: "GET",
        credentials: credentialsOption,
      });

      if (response.status === 200) {
        const respuesta = (await response.json()) as UserLike;
        setUser(respuesta);
        setLogged(true);

        if (respuesta.completed === false) {
          setIsProfileModalOpen(true);
          setIsVerifyModalOpen(false);
        } else if (respuesta.verificated === false) {
          setIsVerifyModalOpen(true);
          setIsProfileModalOpen(false);
        } else {
          setIsProfileModalOpen(false);
          setIsVerifyModalOpen(false);
        }

        return respuesta;
      } else {
        setUser(null);
        setLogged(false);
        setIsProfileModalOpen(false);
        setIsVerifyModalOpen(false);
        return null;
      }
    } catch (error) {
      setUser(null);
      setLogged(false);
      setIsProfileModalOpen(false);
      setIsVerifyModalOpen(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setIsProfileModalOpen, setIsVerifyModalOpen]);

  const logout = useCallback(
    async (showNotification = true) => {
      setActionLoading(true);
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "GET",
          credentials: credentialsOption,
        });
        if (showNotification) toast.success("Sesión cerrada con éxito.");
      } catch (error) {
        if (showNotification)
          toast.error("Error de red al cerrar sesión. Cerrando localmente.");
      } finally {
        setUser(null);
        setLogged(false);
        router.push("/login");
        setLoading(false);
        setActionLoading(false);
        setIsProfileModalOpen(false);
        setIsVerifyModalOpen(false);
      }
    },
    [router, setIsProfileModalOpen, setIsVerifyModalOpen]
  );

  const loginUser = useCallback(
    async (obj: any, from: "user" | "dashboard" = "user") => {
      setActionLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          credentials: credentialsOption,
          headers: { "Content-Type": "application/json;charset=UTF-8" },
          body: JSON.stringify(obj),
        });

        if (response.ok) {
          const loggedInUser = await fetchCurrentUser();

          if (from === "dashboard") {
            const userRole = loggedInUser?.role as string;
            if (userRole === "cliente" || userRole === "rrpp") {
              toast.error("No tienes permisos para acceder al dashboard.");
              await logout(false);
              return;
            }
          }

          if (loggedInUser) {
            if (loggedInUser.completed === false) {
              setIsProfileModalOpen(true);
            } else if (loggedInUser.verificated === false) {
              setIsVerifyModalOpen(true);
            } else {
              const hasExternalRedirect =
                typeof window !== "undefined" &&
                !!sessionStorage.getItem("postLoginRedirect");

              if (!hasExternalRedirect) {
                setRedirectPath(from === "dashboard" ? "/dashboard" : "/");
              } else {
                const link = sessionStorage.getItem("postLoginRedirect");
                sessionStorage.removeItem("postLoginRedirect");
                setRedirectPath(link);
              }
            }
          }
        } else if (response.status === 401) {
          toast.error("Usuario o contraseña incorrectos.");
        } else {
          toast.error("Error al iniciar sesión.");
        }
      } catch (error) {
        toast.error("Error de red al iniciar sesión.");
      } finally {
        setActionLoading(false);
      }
    },
    [fetchCurrentUser, logout, setIsProfileModalOpen, setIsVerifyModalOpen]
  );

  const registerUser = useCallback(
    async (obj: any) => {
      setActionLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: "POST",
          credentials: credentialsOption,
          headers: { "Content-Type": "application/json;charset=UTF-8" },
          body: JSON.stringify(obj),
        });
        if (response.ok) {
          modalFeedbackReact(
            "Verificación de cuenta pendiente",
            "Te enviamos un email para verificar tu cuenta. Si no está en tu casilla principal, revisá Spam y marcá el mensaje como “No es spam”  Abrí el email y hacé clic en “Verificar cuenta” para habilitar el acceso completo. Hasta que verifiques tu cuenta, tu acceso será limitado y algunas funciones no estarán disponibles.",
            "warning",
            true
          )
          toast.success("Mail de verificación enviado con éxito")

          await loginUser({ email: obj.email, password: obj.password }, "user");
        } else {
          let errorMsg = "Error al crear el usuario.";
          if (response.status === 409) {
            errorMsg = "Ya existe un usuario con ese email o alias.";
          } else {
            try {
              const errorBody = await response.json();
              errorMsg = (errorBody as any).message || errorMsg;
            } catch {
              // ignore
            }
          }
          toast.error(errorMsg);
          return null;
        }
      } catch (error) {
        toast.error("Error de red al crear usuario.");
        return null;
      } finally {
        setActionLoading(false);
      }
    },
    [loginUser]
  );

  const updateUser = useCallback(
    async (userData: any) => {
      const userId = userData.id || user?.id;
      if (!userId) {
        toast.error("No se pudo identificar al usuario para actualizar.");
        return null;
      }
      setActionLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: "PUT",
          credentials: credentialsOption,
          headers: { "Content-Type": "application/json;charset=UTF-8" },
          body: JSON.stringify(userData),
        });
        if (response.ok) {
          const updatedUser = await fetchCurrentUser();
          toast.success("Perfil actualizado con éxito.");

          if (updatedUser && userData.completed) {
            setIsProfileModalOpen(false);
            if (updatedUser.verificated === false) {
              setIsVerifyModalOpen(true);
            } else {
              setRedirectPath("/");
            }
          }
          return updatedUser;
        } else {
          toast.error("No se pudo guardar la información.");
          return null;
        }
      } catch (error) {
        toast.error("Error de red al actualizar el perfil.");
        return null;
      } finally {
        setActionLoading(false);
      }
    },
    [user, fetchCurrentUser, setIsProfileModalOpen, setIsVerifyModalOpen]
  );

  const changeUserPhoto = useCallback(
    async (formData: FormData) => {
      if (!user?.id) {
        toast.error(
          "No se pudo identificar al usuario para actualizar la foto."
        );
        return false;
      }
      setActionLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/users/profile/${user.id}`,
          {
            method: "PUT",
            credentials: credentialsOption,
            body: formData, // multipart -> simple, no seteamos Content-Type
          }
        );
        if (response.status === 204 || response.ok) {
          await fetchCurrentUser();
          toast.success("Imagen de perfil actualizada.");
          return true;
        } else {
          toast.error("No se pudo modificar la imagen.");
          return false;
        }
      } catch (error) {
        toast.error("Error de red al modificar la imagen.");
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [user?.id, fetchCurrentUser]
  );

  const checkAlias = useCallback(async (alias: string): Promise<boolean> => {
    if (!alias) return true;
    try {
      const response = await fetch(`${API_BASE_URL}/users/validate/${alias}`, {
        method: "GET",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        credentials: credentialsOption,
      });
      if (response.ok) {
        const data = await response.json();
        return data.aviable === true;
      }
      return false;
    } catch (error) {
      toast.error("Error de red al verificar el alias.");
      return false;
    }
  }, []);

  const changeUserPassword = useCallback(
    async (newPass: string) => {
      if (!user?.email) {
        toast.error("No se pudo identificar al usuario.");
        return false;
      }
      setActionLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/users/recover`, {
          method: "POST",
          credentials: credentialsOption,
          headers: { "Content-Type": "application/json;charset=UTF-8" },
          body: JSON.stringify({ email: user.email, password: newPass }),
        });
        if (response.ok) {
          toast.success("Contraseña modificada con éxito.");
          return true;
        } else {
          const errorBody = await response.json();
          if (errorBody.error === "You must select a new pasword") {
            toast.error("Debes elegir una nueva contraseña.");
          } else {
            toast.error("No se pudo modificar la contraseña.");
          }
          return false;
        }
      } catch (error) {
        toast.error("Error de red al modificar la contraseña.");
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [user?.email]
  );

  const sendRecoveryEmail = useCallback(async (targetUser: UserLike) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/forgot`, {
        method: "POST",
        credentials: credentialsOption,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify({ email: targetUser.email }),
      });
      if (response.ok) {
        toast.success("Correo de recuperación enviado con éxito.");
        return true;
      } else {
        toast.error("No se pudo enviar el correo de recuperación.");
        return false;
      }
    } catch (error) {
      toast.error("Error de red al enviar el correo.");
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const resendVerificationEmail = useCallback(async (targetUser: UserLike) => {
    if (!targetUser?.id) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/resend-email`, {
        method: "POST",
        credentials: credentialsOption,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify({ id: targetUser.id }),
      });
      if (response.ok) {
        toast.success("Correo de verificación reenviado con éxito.");
      } else {
        toast.error("No se pudo reenviar el correo de verificación.");
      }
    } catch (error) {
      toast.error("Error de red al reenviar el correo.");
    } finally {
      setActionLoading(false);
    }
  }, []);

  const loginWithGoogle = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const blockUser = useCallback(
    async (targetUser: UserLike) => {
      setActionLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/users/blocked/${targetUser.id}`,
          {
            method: "PUT",
            credentials: credentialsOption,
            headers: { "Content-Type": "application/json;charset=UTF-8" },
            body: JSON.stringify({ blocked: !targetUser.blocked }),
          }
        );
        if (response.ok) {
          await fetchUsers({
            includeDeleted:
              document.getElementById("show-deleted")?.ariaChecked === "true",
          });
          toast.success(
            `Usuario ${targetUser.blocked ? "desbloqueado" : "bloqueado"} con éxito.`
          );
        } else {
          toast.error("Error al cambiar estado de bloqueo.");
        }
      } catch (error) {
        toast.error("Error de red al cambiar estado de bloqueo.");
      } finally {
        setActionLoading(false);
      }
    },
    [fetchUsers]
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      setActionLoading(true);
      try {
        const url = new URL(`${API_BASE_URL}/users/${userId}`);
        url.searchParams.set("total", "true");
        const response = await fetch(url.toString(), {
          method: "DELETE",
          credentials: credentialsOption,
        });
        if (response.ok || response.status === 204) {
          await fetchUsers({
            includeDeleted:
              document.getElementById("show-deleted")?.ariaChecked === "true",
          });
          toast.success("Usuario eliminado con éxito.");
        } else {
          toast.error("No se pudo eliminar el usuario.");
        }
      } catch (error) {
        toast.error("Error de red al eliminar el usuario.");
      } finally {
        setActionLoading(false);
      }
    },
    [fetchUsers]
  );

  const changeUserRole = useCallback(
    async (targetUser: UserLike, newRole: string, stores: string[]) => {
      setActionLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/users/role/${targetUser.id}`,
          {
            method: "PUT",
            credentials: credentialsOption,
            headers: { "Content-Type": "application/json;charset=UTF-8" },
            body: JSON.stringify({ role: newRole, stores: stores }),
          }
        );
        if (response.ok) {
          await fetchAdmins({});
          toast.success("Rol de usuario cambiado con éxito.");
          return true;
        } else if (response.status === 403) {
          toast.error("No se puede cambiar el rol a un superadmin.");
          return false;
        } else {
          toast.error("No se pudo cambiar el rol.");
          return false;
        }
      } catch (error) {
        toast.error("Error de red al cambiar el rol.");
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchAdmins]
  );

  const getUserByEmail = useCallback(async (email: string, isAdmin = false) => {
    try {
      const url = new URL(`${API_BASE_URL}/users/email/${email}`);
      if (isAdmin) {
        url.searchParams.append("admins", "true");
      }
      const response = await fetch(url.toString(), {
        method: "GET",
        credentials: credentialsOption,
      });
      if (response.ok) {
        return (await response.json()) as UserLike;
      }
      return null;
    } catch (error) {
      toast.error("Error de red al buscar usuario por email.");
      return null;
    }
  }, []);

  const getUserById = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "GET",
        credentials: credentialsOption,
      });
      if (response.ok) {
        return (await response.json()) as UserLike;
      }
      return null;
    } catch (error) {
      toast.error("Error de red al buscar usuario por ID.");
      return null;
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "super-admin")) {
      // Initial fetches are now handled by the pages themselves
    }
  }, [user]);

  useEffect(() => {
    if (redirectPath) {
      router.push(redirectPath);
      setRedirectPath(null);
    }
  }, [redirectPath, router]);

  useEffect(() => {
    if (!loading && logged) {
      try {
        if (typeof window !== "undefined") {
          const to = sessionStorage.getItem("postLoginRedirect");
          if (to) {
            sessionStorage.removeItem("postLoginRedirect");
            router.replace(to);
          }
        }
      } catch {
        // noop
      }
    }
  }, [loading, logged, router]);

  const value: UserContextType = {
    user,
    users,
    admins,
    logged,
    loading,
    actionLoading,
    usersPagination,
    adminsPagination,
    loginUser,
    registerUser,
    updateUser,
    changeUserPhoto,
    loginWithGoogle,
    logout,
    fetchCurrentUser,
    fetchUsers,
    fetchAdmins,
    checkAlias,
    changeUserPassword,
    sendRecoveryEmail,
    resendVerificationEmail,
    blockUser,
    deleteUser,
    changeUserRole,
    getUserByEmail,
    getUserById,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export { UserProvider };
