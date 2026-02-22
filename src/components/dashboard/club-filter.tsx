'use client';
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStores } from "@/contexts/stores-context";
import { cn } from "@/lib/utils";

interface ClubFilterProps {
  selectedClub: string;
  onSelectedClubChange: (value: string) => void;
  className?: string;
}

export function ClubFilter({ selectedClub, onSelectedClubChange, className }: ClubFilterProps) {
  const { getStores, displayStores, canUserManageMultipleStores } = useStores();

  useEffect(() => {
    getStores({ enabled: true });
  }, [getStores]);

  if (!canUserManageMultipleStores) {
    return null;
  }

  return (
    <Select value={selectedClub} onValueChange={onSelectedClubChange}>
      <SelectTrigger className={cn("w-auto min-w-[250px] border-none bg-secondary/40", className)}>
        <SelectValue placeholder="Filtrar por club" />
      </SelectTrigger>
      <SelectContent className="bg-slate-800 border-none">
        <SelectItem value="all">Todos los clubes</SelectItem>
        {displayStores.map((store) => (
          <SelectItem key={store.id} value={store.id}>
            {store.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
