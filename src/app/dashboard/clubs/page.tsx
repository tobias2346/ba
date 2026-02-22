'use client';

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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useStores } from "@/contexts/stores-context";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";

const getStatusVariant = (status: boolean) => {
  return status ? "default" : "secondary";
};

export default function ClubsListPage() {
  const { stores, getStores, loading, deleteStore, displayStores } =
    useStores();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    getStores();
  }, [getStores]);

  useEffect(() => {
    if (user?.role === "manager" && displayStores.length === 1) {
      router.replace(`/dashboard/clubs/${displayStores[0].id}`);
    }
  }, [user, displayStores, router]);

  if (user?.role === "manager" && displayStores.length === 1) {
    return (
      <div className="flex items-center justify-center h-full">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <Card className="border-none bg-secondary/20">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-x-4">
          <Shield className="h-6 w-6" />
          <CardTitle>Clubes Registrados</CardTitle>
          <span className="font-semibold text-primary text-lg bg-primary/20 rounded-2xl flex justify-center items-center w-12 h-7">
            {displayStores.length}
          </span>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre..."
              className="pl-9 border-none bg-secondary/40"
            />
          </div>

          <Button asChild>
            <Link href="/dashboard/clubs/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Club
            </Link>
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
        ) : displayStores.length > 0 ? (
          <>
            {/* ===================== */}
            {/* MOBILE (CARDS) */}
            {/* ===================== */}
            <div className="space-y-4 md:hidden">
              {displayStores.map((club: any) => (
                <div
                  key={club.id}
                  className="rounded-lg border border-secondary bg-secondary/30 p-4"
                >
                  <Link href={`/dashboard/clubs/${club.id}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center">
                        {club.logo ? (
                          <Image
                            src={club.logo}
                            alt={club.name}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        ) : (
                          <Shield className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold">{club.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {club.category?.name || "Sin categoría"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {club.email}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center justify-between mt-4">
                    <Badge
                      variant={getStatusVariant(club.enabled) as any}
                    >
                      {club.enabled ? "Habilitado" : "Deshabilitado"}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="border-none bg-slate-800"
                      >
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/clubs/${club.id}`}>
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteStore(club.id)}
                          className="text-destructive"
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {/* ===================== */}
            {/* DESKTOP (TABLE) */}
            {/* ===================== */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="rounded-xl bg-dark/60 border-none">
                    <TableHead className="w-[5%]" />
                    <TableHead className="w-[25%]">Nombre</TableHead>
                    <TableHead className="w-[20%]">Categoría</TableHead>
                    <TableHead className="w-[25%]">Email</TableHead>
                    <TableHead className="w-[15%]">Estado</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {displayStores.map((club: any) => (
                    <TableRow
                      key={club.id}
                      className="cursor-pointer border-none hover:bg-primary/10"
                    >
                      <TableCell>
                        <Link
                          href={`/dashboard/clubs/${club.id}`}
                          className="block w-full h-full"
                        >
                          <div className="w-8 h-8 flex items-center justify-center">
                            {club.logo ? (
                              <Image
                                src={club.logo}
                                alt={club.name}
                                width={32}
                                height={32}
                                className="object-contain"
                              />
                            ) : (
                              <Shield className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                        </Link>
                      </TableCell>

                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/clubs/${club.id}`}
                          className="block w-full h-full"
                        >
                          {club.name}
                        </Link>
                      </TableCell>

                      <TableCell>
                        <Link
                          href={`/dashboard/clubs/${club.id}`}
                          className="block w-full h-full"
                        >
                          {club.category?.name || "Sin categoría"}
                        </Link>
                      </TableCell>

                      <TableCell>
                        <Link
                          href={`/dashboard/clubs/${club.id}`}
                          className="block w-full h-full"
                        >
                          {club.email}
                        </Link>
                      </TableCell>

                      <TableCell>
                        <Link
                          href={`/dashboard/clubs/${club.id}`}
                          className="block w-full h-full"
                        >
                          <Badge
                            variant={getStatusVariant(club.enabled) as any}
                          >
                            {club.enabled
                              ? "Habilitado"
                              : "Deshabilitado"}
                          </Badge>
                        </Link>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="border-none bg-slate-800"
                          >
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/clubs/${club.id}`}
                              >
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteStore(club.id)}
                              className="text-destructive"
                            >
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
              No tenés clubes registrados.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/dashboard/clubs/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear tu primer club
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
