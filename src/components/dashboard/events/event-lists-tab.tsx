"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  UploadCloud,
  UserPlus,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ListFormModal } from "./list-form-modal";
import { BulkUploadModal } from "./bulk-upload-modal";
import { useLists } from "@/contexts/lists-context";
import { GuestFormModal } from "./guest-form-modal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface EventListsTabProps {
  eventData?: any;
}

export function EventListsTab({ eventData }: EventListsTabProps) {
  const eventId = eventData?.id;
  const {
    lists,
    loading,
    getListsByEvent,
    getListDetails,
    updateList,
    deleteList,
    removeGuest,
  } = useLists();

  const [openLists, setOpenLists] = useState<string[]>([]);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<any | null>(null);
  const [currentListId, setCurrentListId] = useState<any>(null);
  const [editingList, setEditingList] = useState<any | null>(null);
  const [detailedLists, setDetailedLists] = useState<any>({});

  const refreshListDetails = async (listId: string) => {
    const details = await getListDetails(listId);
    if (details) {
      setDetailedLists((prev: any) => ({ ...prev, [listId]: details }));
    }
  };

  const toggleList = async (id: string) => {
    const isOpen = openLists.includes(id);
    if (!isOpen) {
      await refreshListDetails(id);
    }
    setOpenLists((prev) =>
      isOpen ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleOpenListModal = (list: any = null) => {
    setEditingList(list);
    setIsListModalOpen(true);
  };

  const handleOpenBulkModal = (listId: string, numerated: boolean) => {
    setCurrentListId({ listId, sectors: [], numerated });
    setIsBulkModalOpen(true);
  };

  const handleOpenGuestModal = (listId: string, sectorId: string) => {
    const sectors = eventData.catalogItems.find(
      (ca) => ca.sectorId === sectorId
    ) || { seats: [] };
    if (eventData.type === "numerated" && !sectors) {
      return toast.error("Ocurrió un error inesperado");
    }
    setCurrentListId({ listId, sectors });
    setIsGuestModalOpen(true);
  };
  const handleTogglePrivate = (list: any) => {
    updateList(list.id, { private: !list.private });
  };

  const confirmDeleteList = (list: any) => {
    setListToDelete(list);
    setIsDeleteAlertOpen(true);
  };

  const executeDelete = async () => {
    if (listToDelete) {
      await deleteList(listToDelete.id);
      setIsDeleteAlertOpen(false);
      setListToDelete(null);
    }
  };

  const handleDeleteGuest = async (listId: string, guestId: string) => {
    const success = await removeGuest(guestId);
    if (success) {
      await refreshListDetails(listId);
    }
  };

  const handleActionSuccess = (listId: string) => {
    getListsByEvent(eventId);
    if (openLists.includes(listId)) {
      refreshListDetails(listId);
    }
  };

  const fetchData = () => {
    getListsByEvent(eventData.id);
    if (currentListId) refreshListDetails(currentListId.listId);
  };

  useEffect(() => {
    if (eventData?.id) {
      fetchData();
    }
  }, [eventData?.id, getListsByEvent]);

  return (
    <>
      <div className="mt-6 space-y-6">
        <Card className="border-none bg-secondary/20">
          <CardHeader className="flex flex-col md:flex-row sapce-y-5 md:items-center justify-between">
            <div>
              <CardTitle>Listas de Invitados</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                <span>
                  Listas:{" "}
                  <span className="font-bold text-primary">{lists.length}</span>
                </span>
              </div>
            </div>
            <Button onClick={() => handleOpenListModal()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Lista
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && lists.length === 0 ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : lists.length > 0 ? (
              lists.map((list) => (
                <Card key={list.id} className="border-none bg-secondary/20 overflow-hidden">
                  <Collapsible
                    open={openLists.includes(list.id)}
                    onOpenChange={() => toggleList(list.id)}
                    className=""
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4">
                      <div className="flex-1">
                        <h4 className="font-semibold">{list.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>
                            Capacidad: {list.capacity?.base || 0} (
                            {list.capacity?.aviable || 0} libres)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center flex-wrap justify-end gap-2">
                        <span className="text-xs text-muted-foreground">
                          Privada
                        </span>
                        <Switch
                          checked={list.private}
                          onCheckedChange={() => handleTogglePrivate(list)}
                        />

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenGuestModal(list.id, list?.sectorId);
                          }}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenListModal(list);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDeleteList(list);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button> 
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenBulkModal(list.id, list.numerated);
                          }}
                        >
                          <UploadCloud className="mr-2 h-4 w-4" /> Carga Masiva
                        </Button>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon">
                            {openLists.includes(list.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    <CollapsibleContent>
                      <div className="bg-muted/50 p-4 border-t">
                        {detailedLists[list.id]?.guests.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Alias</TableHead>
                                <TableHead>Documento</TableHead>
                                <TableHead>País</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-right">
                                  Acciones
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {detailedLists[list.id].guests.map(
                                (guest: any) => (
                                  <TableRow key={guest.id}>
                                    <TableCell>{guest.name}</TableCell>
                                    <TableCell>{guest.alias}</TableCell>
                                    <TableCell>{guest.document}</TableCell>
                                    <TableCell>{guest.nationality}</TableCell>
                                    <TableCell>{guest.email}</TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          handleDeleteGuest(list.id, guest.id)
                                        }
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center text-sm text-muted-foreground py-4">
                            No hay invitados en esta lista.
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No hay listas de invitados creadas para este evento.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <ListFormModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        initialData={editingList}
        eventData={eventData}
        fetchData={fetchData}
      />
      {currentListId && isBulkModalOpen && (
        <BulkUploadModal
          isOpen={isBulkModalOpen}
          onClose={(success) => {
            setIsBulkModalOpen(false);
            if (success) handleActionSuccess(currentListId);
          }}
          currentListId={currentListId}
          eventId={eventId}
          fetchData={fetchData}
        />
      )}
      {currentListId && isGuestModalOpen && (
        <GuestFormModal
          fetchData={fetchData}
          isOpen={isGuestModalOpen}
          onClose={(success) => {
            setIsGuestModalOpen(false);
            if (success) handleActionSuccess(currentListId);
          }}
          currentListId={currentListId}
          eventId={eventId}
          eventData={eventData}
        />
      )}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro de eliminar esta lista?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              lista y todos sus invitados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-destructive hover:bg-destructive/80"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
