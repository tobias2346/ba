
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2, Edit } from 'lucide-react';
import { AccessCredentialFormModal } from './access-credential-form-modal';
import { useStores } from '@/contexts/stores-context';

interface ConfigAccessControlStepProps {
  clubData: any;
  onUpdate: (updatedData: any) => void;
}

export function ConfigAccessControlStep({ clubData, onUpdate }: ConfigAccessControlStepProps) {
  const { updateStore, loading } = useStores();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<any | null>(null);

  const handleOpenModal = (credential: any = null) => {
    setEditingCredential(credential);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingCredential(null);
    setIsModalOpen(false);
  };

  const handleSaveCredential = async (data: any) => {
    const currentCredentials = clubData.accessControlCredentials || [];
    let updatedCredentials;

    if (editingCredential) {
      // Editing existing credential, preserve its ID
      updatedCredentials = currentCredentials.map((cred: any) =>
        cred.id === editingCredential.id ? { ...editingCredential, ...data } : cred
      );
    } else {
      // Creating new credential, add a new ID
      const newCredential = { ...data, id: Date.now().toString(), status: 'Activo' };
      updatedCredentials = [...currentCredentials, newCredential];
    }

    const updatedStore = await updateStore(clubData.id, { accessControlCredentials: updatedCredentials });
    if (updatedStore) {
      onUpdate(updatedStore);
    }
    handleCloseModal();
  };

  const handleDeleteCredential = async (id: string) => {
    const updatedCredentials = (clubData.accessControlCredentials || []).filter((cred: any) => cred.id !== id);
    const updatedStore = await updateStore(clubData.id, { accessControlCredentials: updatedCredentials });
    if (updatedStore) {
      onUpdate(updatedStore);
    }
  };

  const credentials = clubData.accessControlCredentials || [];

  return (
    <>
      <Card className="mt-4 border-none bg-secondary/20">
        <CardHeader className='flex flex-col md:flex-row space-y-4 justify-between items-center'>
          <div>
            <CardTitle>Credenciales de Acceso</CardTitle>
            <CardDescription>Gestiona los usuarios y contraseñas para la App de Control de Acceso.</CardDescription>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Nueva Credencial
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {credentials.map((cred: any) => (
                <TableRow key={cred.id}>
                  <TableCell className="font-medium">{cred.username}</TableCell>
                  <TableCell>
                    <Badge variant={cred.status === 'Activo' ? 'default' : 'secondary'}>
                      {cred.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenModal(cred)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteCredential(cred.id)} className="text-destructive">
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
        </CardContent>
      </Card>

      <AccessCredentialFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCredential}
        initialData={editingCredential}
      />
    </>
  );
}
