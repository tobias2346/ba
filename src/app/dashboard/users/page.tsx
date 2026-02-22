"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Search,
  Users,
  ShieldCheck,
  MailWarning,
  Trash2,
  KeyRound,
  Eye,
  Edit,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/user-context";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersListPage() {
  const { users, usersPagination, fetchUsers, actionLoading, ...userActions } =
    useUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const router = useRouter();

  const [isEditEmailModalOpen, setIsEditEmailModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(
    null
  );
  const [newEmail, setNewEmail] = useState("");

  // ===== params base =====
  const baseParams = useMemo(
    () => ({
      includeDeleted: showDeleted,
      search: searchTerm,
    }),
    [showDeleted, searchTerm]
  );

  // ===== infinite scroll robusto (root fijo #dashboard-scroll) =====
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollElRef = useRef<HTMLElement | null>(null);
  const hasUserScrolledRef = useRef(false);
  const fetchingMoreRef = useRef(false);

  useEffect(() => {
    scrollElRef.current = document.getElementById("dashboard-scroll");
  }, []);

  useEffect(() => {
    const el = scrollElRef.current;
    if (!el) return;

    const onScroll = () => {
      if (el.scrollTop > 0) hasUserScrolledRef.current = true;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll as any);
  }, []);

  const loadMore = useCallback(() => {
    if (actionLoading) return;
    if (!usersPagination?.hasNextPage) return;
    if (!usersPagination?.nextCursor) return;
    if (fetchingMoreRef.current) return;

    if (!hasUserScrolledRef.current) return;

    fetchingMoreRef.current = true;

    fetchUsers({
      ...baseParams,
      cursor: usersPagination.nextCursor,
    }).finally(() => {
      setTimeout(() => {
        fetchingMoreRef.current = false;
      }, 250);
    });
  }, [
    actionLoading,
    usersPagination?.hasNextPage,
    usersPagination?.nextCursor,
    fetchUsers,
    baseParams,
  ]);

  useEffect(() => {
    const rootEl = scrollElRef.current;
    const sentinel = sentinelRef.current;

    if (!rootEl || !sentinel) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) loadMore();
      },
      {
        root: rootEl,
        rootMargin: "600px 0px 600px 0px",
        threshold: 0,
      }
    );

    obs.observe(sentinel);

    return () => {
      obs.disconnect();
    };
  }, [loadMore, users.length]);

  useEffect(() => {
    fetchingMoreRef.current = false;
    hasUserScrolledRef.current = false;
  }, [baseParams]);

  // ===== carga inicial (debounce) =====
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers({ ...baseParams, cursor: null });
    }, 300);
    return () => clearTimeout(handler);
  }, [baseParams, fetchUsers]);

  const handleBlockUser = (user: any) => {
    userActions.blockUser(user);
  };

  const handleDeleteUser = (user: any) => {
    userActions.deleteUser(user.id);
  };

  const handleSendRecovery = (user: any) => {
    userActions.sendRecoveryEmail(user);
  };

  const handleResendVerification = async (user: any) => {
    try {
      await userActions.resendVerificationEmail(user);
      toast.success("Mail de verificación enviado con éxito");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleOpenEditEmailModal = (user: any) => {
    setSelectedUserForEdit(user);
    setNewEmail(user.email || "");
    setIsEditEmailModalOpen(true);
  };

  const handleCloseEditEmailModal = () => {
    setIsEditEmailModalOpen(false);
    setSelectedUserForEdit(null);
    setNewEmail("");
  };

  const handleEmailUpdate = async () => {
    if (!selectedUserForEdit || !newEmail) return;

    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      toast.error("Por favor, introduce un email válido.");
      return;
    }

    const success = await userActions.updateUser({
      id: selectedUserForEdit.id,
      email: newEmail,
    });

    if (success) {
      handleCloseEditEmailModal();
      await fetchUsers({ ...baseParams, cursor: null });
    }
  };

  const formatDate = (dateString: string | { $date: string }): string => {
    if (!dateString) return "N/A";
    const dateValue =
      typeof dateString === "object" && (dateString as any).$date
        ? (dateString as any).$date
        : dateString;
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "Fecha inválida";
      return date.toLocaleDateString("es-AR");
    } catch {
      return "Fecha inválida";
    }
  };

  return (
    <>
      <Card className="border-none bg-secondary/20">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Users className="h-6 w-6" />
            <CardTitle className="text-base md:text-2xl">
              Usuarios Registrados
            </CardTitle>
            <span className="font-semibold text-primary text-base md:text-lg bg-primary/20 rounded-2xl flex justify-center items-center w-auto px-3 h-7">
              {usersPagination.totalDocs}
            </span>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto md:flex-row md:items-center">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email, nombre o alias..."
                className="pl-9 border-none bg-secondary/40 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="show-deleted"
                checked={showDeleted}
                onCheckedChange={(checked) => setShowDeleted(Boolean(checked))}
              />
              <Label htmlFor="show-deleted" className="text-sm font-medium">
                Mostrar Eliminados
              </Label>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {actionLoading && users.length === 0 ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 md:hidden">
                {users.map((u: any) => (
                  <Card
                    key={u.id}
                    className={cn(
                      "border-none bg-secondary/40",
                      u.deletedAt && "opacity-50"
                    )}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={u.photo} />
                          <AvatarFallback>
                            <Users className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">
                            {u.name} {u.lastName}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-secondary border-none"
                          >
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/users/${u.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenEditEmailModal(u)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Modificar Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSendRecovery(u)}>
                              <KeyRound className="mr-2 h-4 w-4" />
                              Enviar recupero
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleResendVerification(u)}
                              disabled={u.verificated}
                            >
                              <MailWarning className="mr-2 h-4 w-4" />
                              Reenvío verificación
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleBlockUser(u)}>
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              {u.blocked ? "Desbloquear" : "Bloquear"} Usuario
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(u)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar Usuario
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="text-sm space-y-3 flex flex-col">
                        <span>
                          <b>Email:</b> {u.email}
                        </span>
                        <span>
                          <b>DNI:</b> {u.nationality}
                          {u.document}
                        </span>
                        <span>
                          <b>Alias:</b> {u.alias}
                        </span>
                        <span className="col-span-2">
                          <b>Registro:</b> {u.createdAt || "N/A"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-dark/60 border-none">
                      <TableHead />
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead>Alias</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u: any) => (
                      <TableRow
                        key={u.id}
                        onClick={() => router.push(`/dashboard/users/${u.id}`)}
                        className={cn(
                          "cursor-pointer border-none hover:bg-primary/10",
                          u.deletedAt && "opacity-50"
                        )}
                      >
                        <TableCell>
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={u.photo} />
                            <AvatarFallback>
                              <Users className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          {u.name} {u.lastName}
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          {u.email}
                          {u.verificated && (
                            <ShieldCheck className="h-4 w-4 text-primary" />
                          )}
                        </TableCell>
                        <TableCell>
                          {u.nationality}
                          {u.document}
                        </TableCell>
                        <TableCell>{u.alias}</TableCell>
                        <TableCell>{u.createdAt || "N/A"}</TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-secondary border-none"
                            >
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/users/${u.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenEditEmailModal(u)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Modificar Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleSendRecovery(u)}>
                                <KeyRound className="mr-2 h-4 w-4" />
                                Enviar recupero
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleResendVerification(u)}
                                disabled={u.verificated}
                              >
                                <MailWarning className="mr-2 h-4 w-4" />
                                Reenvío verificación
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleBlockUser(u)}>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                {u.blocked ? "Desbloquear" : "Bloquear"} Usuario
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(u)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar Usuario
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* SENTINEL único */}
              <div ref={sentinelRef} className="h-1 w-full" />

              {actionLoading && users.length > 0 && (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditEmailModalOpen} onOpenChange={setIsEditEmailModalOpen}>
        <DialogContent className="border-none">
          <DialogHeader>
            <DialogTitle>Modificar Email</DialogTitle>
            <DialogDescription>Ingresa el nuevo correo electrónico.</DialogDescription>
          </DialogHeader>

          <Input
            className="border-none bg-secondary/40"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />

          <DialogFooter>
            <Button
              variant="outline"
              disabled={actionLoading}
              onClick={handleCloseEditEmailModal}
              className="border-none bg-secondary"
            >
              Cancelar
            </Button>
            <Button disabled={actionLoading} onClick={handleEmailUpdate}>
              {actionLoading && <Spinner size="sm" className="mr-2" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
