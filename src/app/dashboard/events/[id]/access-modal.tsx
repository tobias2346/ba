'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { API_BASE_URL, credentialsOption } from '@/services/enviroment';
import { format, isValid, parse, parseISO } from 'date-fns';
import { NotepadText, UserCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react'

interface AccessModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  id: string | number;
}

const UserAccessCard = ({ access, numerated }: { access: any }) => {
  const owner = access.owner;
  const user = access.assignedUser;
  const status = access.status === 'used' ? 'Ingresado' : 'No ingresado';

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';

    let date = parseISO(dateString);
    if (!isValid(date)) {
      date = parse(dateString, 'dd/MM/yyyy HH:mm', new Date());
    }
    if (!isValid(date)) {
      date = parse(dateString, 'dd/MM/yyyy', new Date());
    }
    if (!isValid(date)) {
      return 'N/A';
    }

    return format(date, "dd/MM/yyyy HH:mm");
  };

  return (
    <article className='flex justify-between items-center gap-4 rounded-xl shadow p-4 w-full h-auto md:h-20 hover:bg-primary/20'>
      {/* Participante */}
      {/* 🔹 Contenedor principal */}
      <div className="w-full h-auto flex flex-col space-y-4 md:items-center my-2 px-4">

        {[
          {
            key: 'participante',
            content: (
              <div className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.photo as string} alt={user?.name as string} />
                  <AvatarFallback>
                    <UserCircle className="h-full w-full text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className='text-lg font-semibold text-light'>
                    {user ? `${user.name || ''} ${user.lastName || ''}`.trim() : 'Invitado'}
                  </h3>
                  <h6 className='text-base text-slate-300'>
                    {`${user?.nationality || ''}${user?.document || ''}`}
                  </h6>
                </div>
              </div>
            )
          },
          {
            key: 'propietario',
            content: (
              <div className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={owner?.photo as string} alt={owner?.name as string} />
                  <AvatarFallback>
                    <NotepadText className="h-full w-full text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className='text-lg font-semibold text-light'>
                    {owner ? `${owner.name || ''} ${owner.lastName || ''}`.trim() : 'Lista'}
                  </h3>
                  <h6 className='text-base text-slate-300'>
                    {`${owner?.nationality || ''}${owner?.document || ''}`}
                  </h6>
                </div>
              </div>
            )
          },
          {
            key: 'hora',
            content: (
              <div className='flex items-start'>
                {formatDate(access.wasUsedAt) || '-'}
              </div>
            )
          },
          numerated
            ? {
              key: 'butaca',
              content: (
                <h3 className='text-lg font-semibold text-light'>
                  {access.seatCode}
                </h3>
              )
            }
            : null,
              numerated
          ? {
            key: 'Sector',
            content: (
              <h3 className='text-lg font-semibold text-light'>
                {access.catalogItemName}
              </h3>
            )
          }
          : null,
          {
            key: 'estado',
            content: (
              <div className='flex items-start'>
                <span
                  className={` px-5 py-1 rounded-lg font-semibold text-sm ${status === 'Ingresado'
                    ? 'bg-green-600'
                    : 'bg-primary/50'
                    }`}
                >
                  {status}
                </span>
              </div>
            )
          }
        ]
          .filter(Boolean)
          .map((item, index, array) => {
            const widthClass = array.length === 5 ? 'w-1/5' : 'w-1/4'
            return (
              <div key={item.key} className={`${widthClass} flex items-center`}>
                {item.content}
              </div>
            )
          })}
      </div>

    </article>
  )
}

const AccessModal = ({ open, setOpen, id, eventData }: AccessModalProps) => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('') // 🔍 filtro por nombre
  const [showUsed, setShowUsed] = useState(true) // ✅ mostrar ingresados
  const [showNotUsed, setShowNotUsed] = useState(true) // ❌ mostrar no ingresados
  const numerated = eventData.type == 'numerated';

  useEffect(() => {
    if (!id || !open) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`${API_BASE_URL}/accesses/events/${id}/control`, {
          method: "GET",
          credentials: credentialsOption
        })
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)

        const json = await res.json()
        setData(json.accesses)
      } catch (err: any) {
        setError(err.message || 'Error al obtener los datos')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, open])

  const usedCount = data.filter(item => item.status === 'used').length;

  // 🧩 Filtro combinado (nombre + estado)
  const filteredData = data.filter(item => {
    const user = item.owner;
    const fullName = `${user?.name || ''} ${user?.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase());

    const isUsed = item.status === 'used';
    const matchesStatus = (showUsed && isUsed) || (showNotUsed && !isUsed);

    return matchesSearch && matchesStatus;
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTitle className='hidden'></DialogTitle>
      <DialogContent className='w-[95vw] min-w-[95vw] border-none h-[90vh] overflow-y-auto soft-scrollbar flex flex-col'>
        <div className='w-full flex flex-col md:flex-row justify-between md:items-center pr-4'>
          <h4 className="text-xl font-headline font-semibold mb-4">Control de Acceso</h4>
          <div className='flex flex-col md:flex-row flex-wrap md:items-center gap-4'>
            <h4 className="text-base font-headline font-semibold mb-4">{data?.length} Usuarios</h4>
            <h4 className="text-base font-headline font-semibold mb-4">{usedCount} Ingresados</h4>
            <h4 className="text-base font-headline font-semibold mb-4">{data?.length - usedCount} No ingresados</h4>
          </div>
        </div>

        {/* 🔍 FILTROS */}
        <div className='flex flex-wrap items-center gap-6 mb-4'>
          <label>
            <h4 className='text-sm font-semibold text-light ml-1 mb-1'>Filtrar por propietario</h4>
            <input
              placeholder='Buscar por propietario...'
              className='w-80 h-10 px-3 shadow rounded text-light bg-secondary/40'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </label>

          <div className="h-full flex items-center gap-3">
            <label className='flex items-center gap-2 text-light text-sm font-semibold'>
              <input
                type="checkbox"
                checked={showUsed}
                onChange={() => setShowUsed(!showUsed)}
                className=' w-4 h-4 bg-primary rounded'
              />
              Mostrar ingresados
            </label>

            <label className='flex items-center gap-2 text-light text-sm font-semibold'>
              <input
                type="checkbox"
                checked={showNotUsed}
                className=' w-4 h-4 bg-primary rounded'
                onChange={() => setShowNotUsed(!showNotUsed)}
              />
              Mostrar no ingresados
            </label>
          </div>
        </div>

        {loading && <p className="text-sm text-gray-400">Cargando...</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}

        {!loading && !error && filteredData?.length === 0 && (
          <p className="text-lg text-gray-200">No hay registros disponibles.</p>
        )}

        {!loading && !error && filteredData?.length > 0 && (
          <>
            <div className='w-full hidden md:flex items-center my-2 px-4 bg-dark/50 py-4 rounded-sm'>
              {[
                { label: 'Participante' },
                { label: 'Propietario' },
                { label: 'Hora de ingreso' },
                numerated ? { label: 'Butaca' } : null,
                numerated ? { label: 'Sector' } : null,
                { label: 'Estado' },
              ]
                .filter(Boolean) // elimina el null si numerated es false
                .map((item, index, array) => {
                  const widthClass =
                    array.length === 5 ? 'w-1/5' : 'w-1/4' // 5 columnas → 20%, 4 columnas → 25%
                  return (
                    <div key={index} className={`${widthClass} flex items-start`}>
                      <h4 className='text-sm font-headline font-semibold'>{item.label}</h4>
                    </div>
                  )
                })}
            </div>
            <ul className="space-y-2">
              {filteredData.map(item => (
                <UserAccessCard key={item.id} access={item} numerated={numerated} />
              ))}
            </ul>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AccessModal
