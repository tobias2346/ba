'use client'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { API_BASE_URL, credentialsOption } from '@/services/enviroment'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import StepOne from './step-one'
import StepTwo from './step-two'

interface ModalSelectorProps {
  open: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  accessId: string
}

const ModalSelector = ({ fetchUsers, open, setOpen }: ModalSelectorProps) => {
  const [alias, setAlias] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const params = useParams();

  const handleClose = () => {
    setOpen(false)
    setAlias('')
  }

  const handleBack = () => handleClose()

  const handleAssign = async (e) => {
    e.preventDefault()
    try {
      let body;
      if (alias) {
        body = { alias, eventId: params.eventId }
      } else {
        body = { email, eventId: params.eventId }
      }
      const res = await fetch(`${API_BASE_URL}/lists/${params.batchId}/invite`, {
        method: "POST",
        credentials: credentialsOption,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        toast.error('No se pudo asignar el evento.')
        return
      }
      toast.success('Ticket asignado')
      fetchUsers()
      setOpen(false)
    } catch (error) {
      toast.error('Error inesperado al asignar el ticket.')
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTitle className="hidden" />
      <DialogContent className="max-w-xs sm:max-w-sm px-8 py-10 rounded-lg border-none bg-dark">
        <form onSubmit={handleAssign} className="w-full flex flex-col items-center gap-5">
          {/* Título */}
          <h2 className="text-lg font-headline font-semibold">Asignar evento</h2>

          {/* Descripción */}
          <p className="text-sm text-center text-slate-300">Al asignar un ticket la persona asignada podrá ingresar al evento con su QR personal. También lo verá en "Mis tickets" de su perfil y podrá gestionarlo si es necesario.</p>

          {/* Step */}
        <StepOne setAlias={setAlias} alias={alias} email={email} setEmail={setEmail} />

          {/* Botones */}
          <ModalActions
            alias={alias}
            email={email}
            onBack={handleBack}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ModalSelector

// 👉 Subcomponente
const ModalActions = ({  alias, onBack, email }: { alias: string, onBack: () => void, email: string }) => (
  <div className="flex justify-between w-full gap-4 mt-2">
    <button
      type="button"
      onClick={onBack}
      className="w-1/2 py-2.5 rounded-md border border-primary text-primary font-medium hover:bg-primary/10 transition-colors"
    >
      Cancelar
    </button>
    <button
      type="submit"
      className={`w-1/2 py-2.5 rounded-md bg-primary text-black font-semibold hover:bg-primary/80 transition-colors ${(alias || email) === '' && 'cursor-not-allowed opacity-50'}`}
      disabled={(alias || email) === ''}
    >
      Asignar
    </button>
  </div>
)
