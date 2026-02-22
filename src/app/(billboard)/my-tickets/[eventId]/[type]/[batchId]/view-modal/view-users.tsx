'use client'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import './view.css'
import modalFeedbackReact from "@/components/shared/feedback-modal"
import { API_BASE_URL, credentialsOption } from "@/services/enviroment"
import { toast } from "sonner"
import { useUser } from "@/contexts/user-context"
import { useState } from "react"

const ViewUsers = ({ isOwner, fetchUsers, users, open, setOpen, eventData }) => {
  const { user } = useUser()
  const numerated = eventData.type === 'numerated'
  const [search, setSearch] = useState('') // 🔍 filtro por email
  const deleteUser = (userItem) => {
    if (!isOwner) return
    modalFeedbackReact(
      "Desvincular usuario",
      `Desvincularás a ${userItem.name} de la lista y este no tendrá acceso al evento`,
      "warning",
      true,
      [
        {
          text: "Desvincular",
          action: async () => {
            const res = await fetch(`${API_BASE_URL}/accesses/${userItem.id}`, {
              method: 'DELETE',
              cache: "no-store",
              credentials: credentialsOption
            })
            if (!res.ok) {
              toast.error("Error al desvincular al usuario")
              return
            }
            toast.success("Usuario desvinculado con éxito")
            fetchUsers()
            setOpen(false)
          },
          type: "primary",
        }
      ]
    )
  }

  // 🧩 Clasificación de usuarios
  const totalUsers = users.length
  const registeredUsers = users.filter(u => u.alias && u.alias.trim() !== '').length
  const unregisteredUsers = totalUsers - registeredUsers

  // 🔍 Filtro por email
  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={() => setOpen(false)}>
      <DialogTitle className="hidden" />
      <DialogContent className="w-[95vw] md:min-w-[95vw] h-[90vh] md:h-[90vh] md:px-8 py-10 rounded-lg border-none bg-background soft-scrollbar flex flex-col">

        {/* 🔹 Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h4 className="text-2xl font-medium font-headline mb-2 md:mb-0">
            Usuarios asignados
          </h4>

          {/* 🏷️ Tags resumen */}
          <div className="flex flex-wrap items-center gap-4">
            <h4 className="text-base font-headline font-semibold text-light">
              Total: <span className="text-primary">{totalUsers}</span>
            </h4>
            <h4 className="text-base font-headline font-semibold text-light">
              Registrados: <span className="text-green-500">{registeredUsers}</span>
            </h4>
            <h4 className="text-base font-headline font-semibold text-light">
              No registrados: <span className="text-red-500">{unregisteredUsers}</span>
            </h4>
          </div>
        </div>

        {/* 🔍 Filtro visual */}
        <div className="flex flex-wrap items-center justify-between mb-4">
          <label className="w-full md:w-auto">
            <h4 className="text-sm font-semibold text-light ml-1 mb-1">
              Filtrar por email
            </h4>
            <input
              className="w-full md:w-64 h-10 font-headline font-medium px-3 bg-secondary text-light rounded-lg shadow border-none"
              placeholder="Buscar por email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>

        {/* 🧩 Cabecera tipo tabla */}
        <div className="hidden md:flex w-full items-center my-2 px-4">
          {[
            { label: 'Nombre' },
            { label: 'Alias' },
            { label: 'Email' },
            numerated ? { label: 'Butaca' } : null,
          ]
            .filter(Boolean)
            .map((item, index, array) => {
              const widthClass = array.length === 4 ? 'w-1/4' : 'w-1/3'
              return (
                <div key={index} className={`${widthClass} flex items-start`}>
                  <h4 className="text-sm font-headline font-semibold">{item.label}</h4>
                </div>
              )
            })}
        </div>

        {/* 🧱 Cuerpo de tabla */}
        <ul className="space-y-2 overflow-y-auto h-[60vh] soft-scrollbar">
          {filteredUsers.length === 0 && (
            <p className="text-gray-300 text-base px-4">
              No se encontraron usuarios.
            </p>
          )}

          {filteredUsers.map((i) => (
            <article
              key={i.id}
              className="flex flex-col md:flex-row justify-between items-center gap-4 bg-secondary rounded-xl shadow p-4 w-full"
            >
              <div className="w-full flex flex-col md:flex-row items-center my-2 px-2 md:px-4 gap-4 md:gap-0">
                {[
                  {
                    key: 'name',
                    content: (
                      <h3 className="text-base flex-grow md:text-lg font-semibold text-light truncate text-ellipsis text-center md:text-left">
                        {i?.name}
                      </h3>
                    ),
                  },
                  {
                    key: 'alias',
                    content: (
                      <h3 className="text-sm md:text-base flex-grow text-slate-300 truncate text-ellipsis text-center md:text-left">
                        {i?.alias || '-'}
                      </h3>
                    ),
                  },
                  {
                    key: 'email',
                    content: (
                      <h3 className="text-sm md:text-base flex-grow text-slate-300 truncate text-ellipsis text-center md:text-left">
                        {i?.email}
                      </h3>
                    ),
                  },
                  numerated
                    ? {
                      key: 'butaca',
                      content: (
                        <h3 className="text-sm md:text-base flex-grow font-semibold text-light truncate text-ellipsis text-center md:text-left">
                          {i?.seat || '-'}
                        </h3>
                      ),
                    }
                    : null
                ]
                  .filter(Boolean)
                  .map((item, index, array) => {
                    const widthClass =
                      array.length === 4
                        ? 'md:w-1/4 w-full'
                        : 'md:w-1/3 w-full'
                    return (
                      <div
                        key={item.key}
                        className={`${widthClass} flex justify-center md:justify-start items-center`}
                      >
                        {item.content}
                      </div>
                    )
                  })}
              </div>

              {/* 🔘 Botón eliminar */}
              {isOwner && user?.alias !== i.alias && (
                <button
                  type="button"
                  onClick={() => deleteUser(i)}
                  className="mt-2 md:mt-0"
                >
                  <Image
                    src="/icons/trash.svg"
                    width={25}
                    height={25}
                    alt="Eliminar"
                  />
                </button>
              )}
            </article>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}

export default ViewUsers
