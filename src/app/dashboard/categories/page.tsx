
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, LayoutGrid, Edit, Trash2 } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react";
import { CategoryFormModal } from "@/components/dashboard/categories/category-form-modal";
import { useStores } from "@/contexts/stores-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const { categories, getCategories, deleteCategory, loading } = useStores();

  useEffect(() => {
    getCategories();
  }, []);

  const handleOpenModal = (category: any = null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setEditingCategory(null);
    setIsModalOpen(false);
  }

  return (
    <>
      <Card>
          <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                  <LayoutGrid className="h-6 w-6" />
                  <CardTitle>Categorías de Clubes</CardTitle>
              </div>
              <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                      Total <span className="font-semibold text-primary">{categories.length}</span>
                  </div>
                  <Button onClick={() => handleOpenModal()}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Nueva Categoría
                  </Button>
              </div>
          </CardHeader>
          <CardContent>
              {loading && categories.length === 0 ? (
                 <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
              ) : categories.length > 0 ? (
                  <Table>
                      <TableHeader>
                          <TableRow>
                          <TableHead className="w-[10%]"></TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead className='text-right'>
                              Acciones
                          </TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {categories.map((category) => (
                          <TableRow key={category.id}>
                              <TableCell>
                                  <Image src={category.logoUrl || '/placeholder.svg'} alt={category.name} width={40} height={40} className="object-contain bg-muted rounded-md p-1" />
                              </TableCell>
                              <TableCell className="font-medium">{category.name}</TableCell>
                              <TableCell className='text-right'>
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                      <Button aria-haspopup="true" size="icon" variant="ghost">
                                          <MoreHorizontal className="h-4 w-4" />
                                          <span className="sr-only">Toggle menu</span>
                                      </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => handleOpenModal(category)}>
                                              <Edit className="mr-2 h-4 w-4" />
                                              Editar
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => deleteCategory(category.id)} className="text-destructive">
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
              ) : (
                  <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed rounded-lg">
                       <LayoutGrid className="h-16 w-16 text-muted-foreground/50" />
                       <p className="mt-4 text-lg font-semibold text-muted-foreground">No tenés categorías registradas.</p>
                       <Button className="mt-6" onClick={() => handleOpenModal()}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Crear tu primera categoría
                      </Button>
                  </div>
              )}
          </CardContent>
      </Card>
      <CategoryFormModal isOpen={isModalOpen} onClose={handleCloseModal} initialData={editingCategory}/>
    </>
  )
}
