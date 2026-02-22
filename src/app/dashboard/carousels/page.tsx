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
  Search,
  GalleryHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CarouselFormModal } from "@/components/dashboard/carousels/carousel-form-modal";
import { useCarousels } from "@/contexts/carousels-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function CarouselsListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCarousel, setEditingCarousel] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { carousels, getCarousels, deleteCarousel, updateCarousel, loading } =
    useCarousels();

  useEffect(() => {
    getCarousels();
  }, [getCarousels]);

  const handleOpenModal = (carousel: any = null) => {
    setEditingCarousel(carousel);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingCarousel(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteCarousel(id);
  };

  const handleToggleActive = (carousel: any) => {
    updateCarousel(carousel.id, {
      name: carousel.name,
      active: !carousel.active,
      position: carousel.position,
    });
  };

  const filteredCarousels = carousels.filter((carousel) =>
    carousel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card className="border-none bg-secondary/20">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-x-4">
            <GalleryHorizontal className="h-6 w-6" />
            <CardTitle>Carruseles de Eventos</CardTitle>
            <span className="font-semibold text-primary text-lg bg-primary/20 rounded-2xl flex justify-center items-center w-12 h-7">
              {filteredCarousels.length}
            </span>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                className="pl-9 border-none bg-secondary/40"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button onClick={() => handleOpenModal()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Carrusel
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading && filteredCarousels.length === 0 ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredCarousels.length > 0 ? (
            <>
              {/* ================= MOBILE ================= */}
              <div className="space-y-4 md:hidden">
                {filteredCarousels.map((carousel) => (
                  <div
                    key={carousel.id}
                    className="rounded-lg border border-secondary bg-secondary/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold">{carousel.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Posición: {carousel.position}
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
                            onClick={() => handleOpenModal(carousel)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(carousel.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm">Mostrar en cartelera</span>
                      <Switch
                        checked={carousel.active}
                        onCheckedChange={() => handleToggleActive(carousel)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* ================= DESKTOP ================= */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="rounded-xl bg-dark/60 border-none">
                      <TableHead className="w-[40%]">Nombre</TableHead>
                      <TableHead className="w-[15%] text-center">
                        Posición
                      </TableHead>
                      <TableHead className="w-[30%] text-center">
                        Mostrar en Cartelera
                      </TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredCarousels.map((carousel) => (
                      <TableRow
                        key={carousel.id}
                        className="border-none hover:bg-primary/10"
                      >
                        <TableCell className="font-medium">
                          {carousel.name}
                        </TableCell>

                        <TableCell className="text-center">
                          {carousel.position}
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={carousel.active}
                              onCheckedChange={() =>
                                handleToggleActive(carousel)
                              }
                            />
                          </div>
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
                            <DropdownMenuContent className="border-none bg-secondary" align="end">
                              <DropdownMenuItem 
                                onClick={() => handleOpenModal(carousel)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(carousel.id)}
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
              <GalleryHorizontal className="h-16 w-16 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-semibold text-muted-foreground">
                {searchTerm
                  ? "No se encontraron carruseles."
                  : "No tenés carruseles registrados."}
              </p>
              {!searchTerm && (
                <Button className="mt-6" onClick={() => handleOpenModal()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear tu primer carrusel
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <CarouselFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={editingCarousel}
      />
    </>
  );
}
