
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UploadCloud, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLists } from '@/contexts/lists-context';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';


interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: (success?: boolean) => void;
  eventId: string;
}

export function BulkUploadModal({ isOpen, onClose, currentListId, eventId, fetchData }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const { bulkInvite, loading, downloadTemplateXlsx } = useLists();
  const {listId, numerated} = currentListId;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
      } else {
        toast.error('Por favor, selecciona un archivo XLSX.');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || droppedFile.name.endsWith('.xlsx')) {
        setFile(droppedFile);
      } else {
        toast.error('Por favor, selecciona un archivo XLSX.');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSave = async () => {
    if (!file) {
      toast.error('Por favor, selecciona un archivo para subir.');
      return;
    }
    const success = await bulkInvite(listId, eventId, file);
    if (success) {
      onClose(true);
      fetchData();
    }
  }

  const handleDownloadTemplate = () => {
    downloadTemplateXlsx(numerated);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Carga Masiva de Invitados</DialogTitle>
          <DialogDescription>
            Sube un archivo XLSX con la lista de invitados. El archivo debe contener las columnas &quot;alias&quot; o &quot;email&quot;.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto pr-6 pl-1 space-y-4">
          <div
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Arrastra y suelta un archivo XLSX aquí o haz clic para seleccionarlo.
            </p>
            <Input id="xlsx-upload" type="file" className="hidden" onChange={handleFileChange} accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
            <Button variant="link" size="sm" asChild className='mt-2'>
              <label htmlFor="xlsx-upload">Seleccionar archivo</label>
            </Button>
            {file && (
              <p className="mt-2 text-sm font-medium text-primary">Archivo seleccionado: {file.name}</p>
            )}
          </div>

          <Button variant="secondary" size="sm" onClick={handleDownloadTemplate} disabled={loading}>
            {loading && <Spinner size='sm' className='mr-2 h-4 w-4' />}
            <FileText className="mr-2 h-4 w-4" />
            Descargar plantilla XLSX
          </Button>

        </div>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => onClose()} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!file || loading}>
            {loading && <Spinner size="sm" className='mr-2' />}
            Cargar Invitados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
