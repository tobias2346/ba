'use client'
import React, { useState } from 'react'
import CommonModal from '../common/common-modal'
import CommonButton from '../common/common-button'
import { toast } from 'sonner'
import { API_BASE_URL } from '@/services/enviroment'

const ContactModal = ({ open, setOpen, preSelected = '' }) => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState(preSelected || '')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/users/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, type, message }),
      })

      if (!res.ok) throw new Error('Error enviando la consulta')

      toast.success('Consulta enviada correctamente')
      // limpiar form
      setEmail('')
      setName('')
      setType(preSelected || '')
      setMessage('')
    } catch (err: any) {
      toast.error(err.message || 'Error al enviar consulta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CommonModal open={open} setOpen={setOpen}>
      {/* Título */}
      <h2 className="text-lg font-semibold text-center">
        Envíanos tu consulta!
      </h2>
      <p className="text-sm text-light/60 text-center">
        Responderemos a la brevedad
      </p>

      {/* Formulario */}
      <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email*"
          required
          className="w-full h-11 rounded-md px-3 bg-background focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nombre*"
          required
          className="w-full h-11 rounded-md px-3 bg-background focus:outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="w-full h-11 rounded-md px-3 bg-background focus:outline-none"
          required
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="" disabled>
            Tipo de consulta
          </option>
          <option value="Comercial">Comercial</option>
          <option value="Soporte">Soporte</option>
          <option value="Otro">Otro</option>
        </select>

        <textarea
          placeholder="Mensaje"
          rows={4}
          className="w-full rounded-md px-3 py-2 bg-background focus:outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* Botones */}
        <div className="flex justify-center gap-4 pt-2">
          <CommonButton
            type="ghost"
            action={() => setOpen(false)}
            text="Cancelar"
          />
          <button
            className='px-4 py-2 font-medium rounded-lg shadow transition-colors duration-200 text-base bg-primary text-black hover:bg-primary/80'
            type="submit"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar consulta'}
          </button>
        </div>
      </form>
    </CommonModal>
  )
}

export default ContactModal
