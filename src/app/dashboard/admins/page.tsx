'use client';

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  PlusCircle,
  Shield,
  Search,
  Edit,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdminFormModal } from "@/components/dashboard/admins/admin-form-modal";
import { useUser } from "@/contexts/user-context";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserLike } from "@/contexts/user-context";
import { ClubFilter } from "@/components/dashboard/club-filter";

const getRoleVariant = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return "default";
    case "manager":
      return "secondary";
    case "data analyst":
      return "outline";
    default:
      return "outline";
  }
};

const formatRole = (role: string) => {
  if (!role) return "";
  return role
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-");
};

const renderClubs = (stores: any[]) => {
  if (!stores || stores.length === 0) return "Sin club";
  if (stores.length === 1)
    return typeof stores[0] === "object" ? stores[0].name : stores[0];
  return `${stores.length} clubes`;
};

export default function AdminsListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<UserLike | null>(null);
  const { admins, loading, changeUserRole, fetchAdmins } = useUser();
  const handleOpenModal = (admin: UserLike | null = null) => {
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAdmin(null);
  };

  const handleDeleteAdmin = (admin: UserLike) => {
    changeUserRole(admin, "cliente", []);
  };

  useEffect(() => {
   fetchAdmins()
  }, [])
  
  return (
    <>
      <Card className="border-none bg-secondary/20">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-x-4">
            <Shield className="h-6 w-6" />
            <CardTitle>Administradores</CardTitle>
            <span className="font-semibold text-primary text-lg bg-primary/20 rounded-2xl flex justify-center items-center w-12 h-7">
              {admins.length}
            </span>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                className="pl-9 border-none bg-secondary/40"
              />
            </div>

            <ClubFilter />

            <Button onClick={() => handleOpenModal()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Administrador
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : admins.length > 0 ? (
            <>
              {/* ================= MOBILE ================= */}
              <div className="space-y-4 md:hidden">
                {admins.map((admin: any) => (
                  <div
                    key={admin.id}
                    className="rounded-lg border border-secondary bg-secondary/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold">
                          {admin.name} {admin.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {admin.email}
                        </p>
                        <Badge
                          variant={getRoleVariant(admin.role) as any}
                          className="mt-1"
                        >
                          {formatRole(admin.role)}
                        </Badge>
                        <p className="text-sm mt-1">
                          <span className="font-medium">Club:</span>{" "}
                          {renderClubs(admin.stores)}
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleOpenModal(admin)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteAdmin(admin)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>

              {/* ================= DESKTOP ================= */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="rounded-xl bg-dark/60 border-none">
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Club</TableHead>
                      <TableHead className="text-right">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {admins.map((admin: any) => (
                      <TableRow
                        key={admin.id}
                        className="border-none hover:bg-primary/10"
                      >
                        <TableCell className="font-medium">
                          {admin.name} {admin.lastName}
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getRoleVariant(admin.role) as any}
                          >
                            {formatRole(admin.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {renderClubs(admin.stores)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-secondary border-none" align="end">
                              <DropdownMenuItem
                                onClick={() => handleOpenModal(admin)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteAdmin(admin)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed rounded-lg">
              <Shield className="h-16 w-16 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-semibold text-muted-foreground">
                No tenés administradores registrados.
              </p>
              <Button className="mt-6" onClick={() => handleOpenModal()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear tu primer administrador
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AdminFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={selectedAdmin}
      />
    </>
  );
}
