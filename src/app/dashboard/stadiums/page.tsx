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
import { MoreHorizontal, PlusCircle, Building } from "lucide-react";
import { ClubFilter } from "@/components/dashboard/club-filter";
import { useStores } from "@/contexts/stores-context";
import { useEffect } from "react";
import { useStadiums } from "@/contexts/stadiums-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

const getTypeVariant = (type: string) => {
  switch (type?.toLowerCase()) {
    case "numerado":
    case "numerated":
      return "default";
    case "sectorizado":
    case "sectorized":
      return "secondary";
    default:
      return "outline";
  }
};

const translateType = (type: string) => {
  switch (type?.toLowerCase()) {
    case "numerated":
      return "Numerado";
    case "sectorized":
      return "Sectorizado";
    default:
      return type;
  }
};

export default function StadiumsListPage() {
  const { selectedClub, setSelectedClub, canUserManageMultipleStores } =
    useStores();
  const { stadiums, getStadiums, deleteStadium, loading } = useStadiums();
  const router = useRouter();

  const isCreateDisabled =
    canUserManageMultipleStores && selectedClub === "all";

  useEffect(() => {
    getStadiums(selectedClub);
  }, [selectedClub, getStadiums]);

  const handleCreateClick = () => {
    if (!isCreateDisabled) {
      router.push(`/dashboard/stadiums/new?storeId=${selectedClub}`);
    }
  };

  const handleEditClick = (stadiumId: string) => {
    router.push(`/dashboard/stadiums/new?id=${stadiumId}`);
  };

  return (
    <Card className="border-none bg-secondary/20">
      {/* ================= HEADER ================= */}
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <CardTitle>Estadios</CardTitle>
          <span className="font-semibold text-primary text-lg bg-primary/20 rounded-2xl flex justify-center items-center w-12 h-7">
            {stadiums.length}
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <ClubFilter
            selectedClub={selectedClub}
            onSelectedClubChange={setSelectedClub}
          />
          <Button
            onClick={handleCreateClick}
            disabled={isCreateDisabled}
            className="w-full sm:w-auto"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Estadio
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
        ) : stadiums.length > 0 ? (
          <>
            {/* ================= MOBILE ================= */}
            <div className="flex flex-col gap-4 md:hidden">
              {stadiums.map((stadium: any) => (
                <Card
                  key={stadium.id}
                  className="border-none bg-secondary/40"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg">
                          {stadium.name}
                        </p>
                        <Badge
                          variant={getTypeVariant(stadium.type) as any}
                          className="mt-1"
                        >
                          {translateType(stadium.type)}
                        </Badge>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditClick(stadium.id)}
                          >
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteStadium(stadium.id)}
                            className="text-destructive"
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {stadium.type === "numerated"
                        ? `${stadium.stands.length} tribunas`
                        : `${stadium.sectors.length} sectores`}
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
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-center">
                      Tribunas / Sectores
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stadiums.map((stadium: any) => (
                    <TableRow
                      key={stadium.id}
                      className="border-none hover:bg-primary/10"
                    >
                      <TableCell className="font-medium">
                        {stadium.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getTypeVariant(stadium.type) as any}
                        >
                          {translateType(stadium.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {stadium.type === "numerated"
                          ? stadium.stands.length
                          : stadium.sectors.length}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-none bg-secondary">
                            <DropdownMenuItem className="hover:bg-primary/10"
                              onClick={() => handleEditClick(stadium.id)}
                            >
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-primary/10"
                              onClick={() => deleteStadium(stadium.id)}
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
            <Building className="h-16 w-16 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-semibold text-muted-foreground">
              No tenés estadios creados.
            </p>
            <Button
              className="mt-6"
              onClick={handleCreateClick}
              disabled={isCreateDisabled}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear tu primer estadio
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
