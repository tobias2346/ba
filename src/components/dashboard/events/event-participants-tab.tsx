"use client";

import React, { useState, useMemo } from "react";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  Ticket,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAccesses } from "@/contexts/accesses-context";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import type { Participant } from "@/contexts/accesses-context";

const getAccessTypeIcon = (type: string) => {
  switch (type) {
    case "ticket":
      return <Ticket className="h-4 w-4 mr-2" />;
    case "combo":
    case "comboX":
    case "comboM":
      return <Users className="h-4 w-4 mr-2" />;
    default:
      return null;
  }
};

interface EventParticipantsTabProps {
  participants: Participant[];
  loading: boolean;
}

export function EventParticipantsTab({
  participants,
  loading,
}: EventParticipantsTabProps) {
  const { id } = useParams();
  const { exportParticipants } = useAccesses();

  const [openRows, setOpenRows] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleRow = (alias: string) => {
    setOpenRows((prev) =>
      prev.includes(alias)
        ? prev.filter((x) => x !== alias)
        : [...prev, alias]
    );
  };

  const filteredParticipants = useMemo(() => {
    if (!searchTerm) return participants;

    const q = searchTerm.toLowerCase();
    return participants.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.document?.toLowerCase().includes(q) ||
        p.alias?.toLowerCase().includes(q)
    );
  }, [participants, searchTerm]);

  return (
    <div className="mt-6">
      <Card className='border-none bg-light text-primary shadow-xl'>
        <CardHeader>
          <div className="flex flex-col space-y-5 md:flex-row md:items-center justify-between">
            <div>
              <CardTitle>Participantes</CardTitle>
              <p className="text-sm text-muted-foreground pt-1">
                Total de invitados:{" "}
                <span className="font-semibold text-primary">
                  {filteredParticipants.length}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-grow w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, documento o alias..."
                  className="pl-9 bg-light text-primary shadow-xl border-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button
                variant="outline"
                className="border-none"
                onClick={() => exportParticipants(id as string)}
              >
                <Download className="mr-2 h-4 w-4" /> Exportar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredParticipants.length > 0 ? (
            <>
              <div className="flex flex-col gap-4 md:hidden">
                {filteredParticipants.map((p, i) => (
                  <Card
                    key={i}
                    className="border-none bg-light text-primary shadow-xl"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className="font-semibold">
                            {p.name || "Sin nombre"}
                          </p>
                        </div>

                      </div>

                      <div className="text-sm space-y-3">
                        <div className="flex justify-between">
                          <span>Alias</span>
                          <span>{p.alias}</span>
                        </div>

                        <div className="flex justify-between">
                          <span>Nombre</span>
                          <span>{p.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pais</span>
                          <span>{p.nationality}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Documento</span>
                          <span>{p.document}</span>

                        </div>
                        <div className="flex justify-between">
                          <span>Origen</span>
                          <Badge
                            variant={
                              p.origin === "owner" ? "default" : "secondary"
                            }
                          >
                            {p.origin === "owner"
                              ? "Dueño"
                              : "Asignado"}
                          </Badge>

                        </div>
                        <div className="flex justify-between">
                          <span>Tipo de Acceso</span>
                          <div className="flex items-center">
                            {p.access?.type
                              ? getAccessTypeIcon(p.access.type)
                              : null}
                            <span>{p.access?.type || "-"}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>Aclaración</span>
                          {p.unasigned?.length > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleRow(p.alias)}
                            >
                              {openRows.includes(p.alias) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                        <Table> 
                          <TableBody>
                           {p.unasigned?.length > 0 &&
                          openRows.includes(p.alias) && (
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                              <TableCell colSpan={8} className="p-0">
                                <div className="p-4">
                                  <h4 className="font-semibold mb-2 text-sm">
                                    Accesos sin asignar
                                  </h4>

                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Aclaración</TableHead>
                                        <TableHead>Sin Asignar</TableHead>
                                      </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                      {p.unasigned.map((u, i) => (
                                        <TableRow key={i}>
                                          <TableCell>
                                            <div className="flex items-center">
                                              {getAccessTypeIcon(u.type)}
                                              {u.type}
                                            </div>
                                          </TableCell>
                                          <TableCell>{u.name}</TableCell>
                                          <TableCell>{u.unasigned}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}</TableBody></Table>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className=" hidden md:block border-none rounded-md">

                <Table>
                  <TableHeader>
                    <TableRow className="border-none bg-dark/50">
                      <TableHead>Alias</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>País</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Origen</TableHead>
                      <TableHead>Tipo de Acceso</TableHead>
                      <TableHead>Aclaración</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredParticipants.map((p, index) => (
                      <React.Fragment key={`${p.alias}-${index}`}>
                        <TableRow className="border-none hover:bg-primary/20">
                          <TableCell>{p.alias}</TableCell>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>{p.nationality}</TableCell>
                          <TableCell>{p.document}</TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                p.origin === "owner" ? "default" : "secondary"
                              }
                            >
                              {p.origin === "owner"
                                ? "Dueño"
                                : "Asignado"}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center">
                              {p.access?.type
                                ? getAccessTypeIcon(p.access.type)
                                : null}
                              <span>{p.access?.type || "-"}</span>
                            </div>
                          </TableCell>

                          <TableCell>{p.access?.name || "-"}</TableCell>

                          <TableCell className="text-right">
                            {p.unasigned?.length > 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleRow(p.alias)}
                              >
                                {openRows.includes(p.alias) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>

                        {p.unasigned?.length > 0 &&
                          openRows.includes(p.alias) && (
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                              <TableCell colSpan={8} className="p-0">
                                <div className="p-4">
                                  <h4 className="font-semibold mb-2 text-sm">
                                    Accesos sin asignar
                                  </h4>

                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Aclaración</TableHead>
                                        <TableHead>Sin Asignar</TableHead>
                                      </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                      {p.unasigned.map((u, i) => (
                                        <TableRow key={i}>
                                          <TableCell>
                                            <div className="flex items-center">
                                              {getAccessTypeIcon(u.type)}
                                              {u.type}
                                            </div>
                                          </TableCell>
                                          <TableCell>{u.name}</TableCell>
                                          <TableCell>{u.unasigned}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <p>No hay participantes para este evento.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
