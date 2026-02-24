"use client";
import { ClubFilter } from "@/components/dashboard/club-filter";
import { RrppAssociationModal } from "@/components/dashboard/rrpp/rrpp-association-modal";
import DeleteRRPPModal from "@/components/dashboard/rrpp/rrpp-delete-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRRPP, type RRPP } from "@/contexts/rrpp-context";
import { useStores } from "@/contexts/stores-context";
import {
  EllipsisVertical,
  PlusCircle,
  Receipt,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import LiquidRRPPModal from "@/components/dashboard/rrpp/rrpp-liquid-modal";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BlockLoader } from "@/components/shared/block-loader";

export default function RRPPPage() {
  const {
    displayStores,
    selectedClub,
    setSelectedClub,
    canUserManageMultipleStores,
  } = useStores();
  const { getRRPPsByStoreId, loading, deleteRRPP, liquidRRPP } = useRRPP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rrppList, setRrppList] = useState<RRPP[]>([]);
  const [search, setSearch] = useState("");
  const [liquidOpen, setLiquidOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [targetRRPP, setTargetRRPP] = useState<RRPP | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false)
  const isCreateDisabled =
    canUserManageMultipleStores && selectedClub === "all";

  const renderClubs = (stores: string[] = []) => {
    if (!stores.length) return "Sin club";
    const firstName =
      displayStores?.find((s) => s.id === stores[0])?.name || "Sin club";
    if (stores.length === 1) return firstName;
    const rest = stores.length - 1;
    return `${firstName} +${rest} ${rest === 1 ? "club" : "clubes"}`;
  };

  const fetchRrppForSelection = useCallback(async () => {
    if (
      canUserManageMultipleStores &&
      (selectedClub === "all" || !selectedClub)
    ) {
      const data = await getRRPPsByStoreId("all", {
        includeDeleted: false,
        onlyEnabled: false,
        onlyMatchedStore: true,
      });
      setRrppList(data);
      return;
    }

    if (selectedClub && selectedClub !== "all") {
      const data = await getRRPPsByStoreId(selectedClub, {
        includeDeleted: false,
        onlyEnabled: false,
        onlyMatchedStore: true,
      });
      setRrppList(data);
    }
  }, [selectedClub, canUserManageMultipleStores, getRRPPsByStoreId]);

  useEffect(() => {
    fetchRrppForSelection();
  }, [fetchRrppForSelection]);

  const askDeleteRRPP = (rrpp: RRPP) => {
    setTargetRRPP(rrpp);
    setDeleteOpen(true);
  };

  const askLiquidRRPP = (rrpp: RRPP) => {
    setTargetRRPP(rrpp);
    setLiquidOpen(true);
  };

  const confirmDelete = async () => {
    if (!targetRRPP) return;
    const storeIdToUse =
      selectedClub && selectedClub !== "all"
        ? selectedClub
        : targetRRPP.stores?.[0] || "";
    if (!storeIdToUse) return;

    setDeleting(true);
    const ok = await deleteRRPP(targetRRPP.id, storeIdToUse);
    setDeleting(false);

    if (ok) {
      setRrppList((prev) => prev.filter((r) => r.id !== targetRRPP.id));
      setDeleteOpen(false);
      setTargetRRPP(null);
    }
  };

  const confirmLiquid = async (startDate, endDate) => {
    if (!targetRRPP) return;

    setIsSubmiting(true)
    const ok = await liquidRRPP(targetRRPP.id, startDate, endDate);
    setIsSubmiting(false)
    if (ok) {
      setRrppList((prev) => prev.filter((r) => r.id !== targetRRPP.id));
      setLiquidOpen(false);
      setTargetRRPP(null);
    } else {
      setLiquidOpen(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rrppList;
    return rrppList.filter((r) => {
      const name = `${r.name ?? ""} ${r.lastName ?? ""}`.toLowerCase();
      const email = (r.email ?? "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [search, rrppList]);

  return (
    <>
      <Card className="border-none bg-light text-primary shadow-xl">
        {/* ================= HEADER ================= */}
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6" />
            <CardTitle>RRPP</CardTitle>
            <span className="font-semibold text-primary text-lg bg-primary/20 rounded-2xl flex justify-center items-center w-12 h-7">
              {filtered.length}
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <ClubFilter
              selectedClub={selectedClub}
              onSelectedClubChange={setSelectedClub}
            />

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                className="pl-9 border-none bg-light text-primary shadow-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {isCreateDisabled ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex w-full sm:w-auto">
                      <Button disabled className="w-full sm:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Asociar RRPP
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Seleccioná un CLUB para poder asociar un RRPP.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Asociar RRPP
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filtered.length > 0 ? (
            <>
              {/* ================= MOBILE ================= */}
              <div className="flex flex-col gap-4 md:hidden">
                {filtered.map((rrpp) => (
                  <Card
                    key={rrpp.id}
                    className="border-none bg-light text-primary shadow-xl"
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">
                            {rrpp.name} {rrpp.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {rrpp.email}
                          </p>
                        </div>

                        {(selectedClub && selectedClub !== "all") ||
                          (rrpp.stores?.length ?? 0) > 0 ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <EllipsisVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => askDeleteRRPP(rrpp)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : null}
                      </div>

                      <div className="text-sm">
                        <span className="font-medium">Clubes:</span>{" "}
                        {renderClubs(rrpp.stores)}
                      </div>

                      <div className="text-sm">
                        <span className="font-medium">Eventos:</span>{" "}
                        {(rrpp as any).eventsLength ?? 0}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* ================= DESKTOP ================= */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="rounded-xl bg-dark/60 border-none">
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Club(s)</TableHead>
                      <TableHead className="text-center">
                        Eventos asignados
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((rrpp) => (
                      <TableRow
                        key={rrpp.id}
                        className="border-none hover:bg-primary/10"
                      >
                        <TableCell className="font-medium">
                          {rrpp.name} {rrpp.lastName}
                        </TableCell>
                        <TableCell>{rrpp.email}</TableCell>
                        <TableCell>{renderClubs(rrpp.stores)}</TableCell>
                        <TableCell className="text-center">
                          {(rrpp as any).eventsLength ?? 0}
                        </TableCell>
                        <TableCell className="text-right">
                          {(selectedClub && selectedClub !== "all") ||
                            (rrpp.stores?.length ?? 0) > 0 ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <EllipsisVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="border-none" align="end">
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => askDeleteRRPP(rrpp)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => askLiquidRRPP(rrpp)}
                                >
                                  <Receipt className="h-4 w-4 mr-2" />
                                  Liquidar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed rounded-lg">
              <Users className="h-16 w-16 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-semibold text-muted-foreground">
                No tenés RRPP registrados.
              </p>
              <Button
                className="mt-6"
                onClick={() => setIsModalOpen(true)}
                disabled={isCreateDisabled}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Asociar un RRPP
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={isSubmiting} onOpenChange={() => setIsSubmiting(true)}>
        <DialogTitle className="hidden"></DialogTitle>
        <DialogContent className="max-w-xs sm:max-w-sm px-4 py-10 rounded-lg border-none bg-dark">
          <BlockLoader messages={['Creando Plantilla', 'Leyendo transacciones ' , 'Cargando RRPP']} />
        </DialogContent>
      </Dialog>
      <DeleteRRPPModal
        open={deleteOpen}
        rrpp={targetRRPP}
        loading={deleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />

      <LiquidRRPPModal
        open={liquidOpen}
        rrpp={targetRRPP}
        loading={deleting}
        onCancel={() => setLiquidOpen(false)}
        onConfirm={confirmLiquid}
      />


      <RrppAssociationModal
        isOpen={isModalOpen}
        onClose={(refresh) => {
          setIsModalOpen(false);
          if (refresh) fetchRrppForSelection();
        }}
      />
    </>
  );
}
