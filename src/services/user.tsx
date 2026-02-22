import { UserLike } from "@/contexts/user-context";
import { toast } from "sonner";

const entorno = process.env.NEXT_PUBLIC_ENTORNO;
const API_BASE_URL =
  entorno === "develop"
    ? process.env.NEXT_PUBLIC_API_DEV_URL
    : process.env.NEXT_PUBLIC_API_URL;

const credentialsOption: RequestCredentials =
  entorno !== "develop" ? "include" : "omit";

export const userServices = () => {

  const fetchUsers = async (includeDeleted = false) => {

    const url = new URL(`${API_BASE_URL}/users`);
    if (includeDeleted) {
      url.searchParams.append("deleted", "include");
    }

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        credentials: credentialsOption,
        // ⛔️ Sin headers -> evitamos preflight
      });
      if (!response.ok) {
        toast.error("Error al cargar usuarios.");
        return [];
      }
      const data = await response.json();
      return data || [];
    } catch (err) {
      toast.error("Error de red al cargar usuarios.");
      return [];
    }
  }

  const blockUser = async (targetUser: UserLike) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/blocked/${targetUser.id}`,
        {
          method: "PUT",
          credentials: credentialsOption,
          headers: {
            "Content-Type": "application/json;charset=UTF-8"
          },
          body: JSON.stringify({ blocked: !targetUser.blocked }),
        }
      );

      if (response.ok) {
        toast.success(
          `Usuario ${targetUser.blocked ? "desbloqueado" : "bloqueado"} con éxito.`
        );
        return true;
      } else {
        toast.error("Error al cambiar estado de bloqueo.");
        return false;
      }
    } catch (err) {
      toast.error("Error de red al cambiar estado de bloqueo.");
      return false;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
        credentials: credentialsOption,
      });

      if (response.ok || response.status === 204) {
        toast.success("Usuario eliminado con éxito.");
        return true;
      } else {
        toast.error("No se pudo eliminar el usuario.");
        return false;
      }
    } catch (err) {
      toast.error("Error de red al eliminar el usuario.");
      return false;
    }
  };

  const changeUserRole = async (
    targetUser: UserLike,
    newRole: string,
    clubs: string[]
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/role/${targetUser.id}`,
        {
          method: "PUT",
          credentials: credentialsOption,
          headers: {
            "Content-Type": "application/json;charset=UTF-8"
          },
          body: JSON.stringify({ role: newRole, clubs }),
        }
      );

      if (response.ok) {
        toast.success("Rol de usuario cambiado con éxito.");
        return true;
      } else if (response.status === 403) {
        toast.error("No se puede cambiar el rol a un superadmin.");
        return false;
      } else {
        toast.error("No se pudo cambiar el rol.");
        return false;
      }
    } catch (err) {
      toast.error("Error de red al cambiar el rol.");
      return false;
    }
  };

  const checkAlias = async (alias: string): Promise<boolean> => {
    if (!alias) return true;
    try {
      const response = await fetch(`${API_BASE_URL}/users/alias/${alias}`, {
        method: "GET",
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
  };

  const changeUserPassword = async (email: string, newPass: string): Promise<boolean> => {
    if (!email) {
      toast.error("No se pudo identificar al usuario.");
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/recover`, {
        method: "POST",
        credentials: credentialsOption,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify({ email, password: newPass }),
      });

      if (response.ok) {
        toast.success("Contraseña modificada con éxito.");
        return true;
      } else {
        toast.error("No se pudo modificar la contraseña.");
        return false;
      }
    } catch (error) {
      toast.error("Error de red al modificar la contraseña.");
      return false;
    }
  };

  const sendRecoveryEmail = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/forgot`, {
        method: "POST",
        credentials: credentialsOption,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify({ email }),
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
    }
  };

  const resendVerificationEmail = async (id: string): Promise<boolean> => {
    if (!id) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/users/resend-email`, {
        method: "POST",
        credentials: credentialsOption,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        toast.success("Correo de verificación reenviado con éxito.");
        return true;
      } else {
        toast.error("No se pudo reenviar el correo de verificación.");
        return false;
      }
    } catch (error) {
      toast.error("Error de red al reenviar el correo.");
      return false;
    }
  };

  const getUserByEmail = async (email: string): Promise<UserLike | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/email/${email}`, {
        method: "GET",
        credentials: credentialsOption,
      });

      if (response.ok) {
        return (await response.json()) as UserLike;
      }
      return null;
    } catch (error) {
      toast.error("Error de red al buscar usuario.");
      return null;
    }
  };

  const getUserById = async (id: string): Promise<UserLike | null> => {
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
      toast.error("Error de red al buscar usuario.");
      return null;
    }
  };

  const updateUser = async (
    userId: string,
    userData: any,
    fetchCurrentUser: () => Promise<UserLike | null>,
    onProfileCompleted?: (updatedUser: UserLike) => void
  ): Promise<UserLike | null> => {
    if (!userId) {
      toast.error("No se pudo identificar al usuario para actualizar.");
      return null;
    }

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

        if (updatedUser && userData.completed && onProfileCompleted) {
          onProfileCompleted(updatedUser); // el flujo lo decide el llamador
        }

        return updatedUser;
      } else {
        toast.error("No se pudo guardar la información.");
        return null;
      }
    } catch (error) {
      toast.error("Error de red al actualizar el perfil.");
      return null;
    }
  };

  const changeUserPhoto = async (
    userId: string,
    formData: FormData,
    fetchCurrentUser: () => Promise<void>
  ): Promise<boolean> => {
    if (!userId) {
      toast.error("No se pudo identificar al usuario para actualizar la foto.");
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/profile/${userId}`, {
        method: "PUT",
        credentials: credentialsOption,
        body: formData, // no headers para evitar preflight
      });

      if (response.ok || response.status === 204) {
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
    }
  };

  return {
    fetchUsers,
    deleteUser,
    blockUser,
    changeUserRole,
    getUserByEmail,
    getUserById,
    resendVerificationEmail,
    sendRecoveryEmail,
    changeUserPassword,
    checkAlias,
    changeUserPhoto,
    updateUser
  }
}
