'use client'
import React, { useState } from 'react'
import CommonButton from '../common/common-button'
import { Calendar22 } from '../filter/date'
import Categories from '../filter/categories'
import Clubs from '../filter/cubs'
import { API_BASE_URL } from '@/services/enviroment'
import Image from 'next/image'

const EventFilterDesktop = ({ setLoading, setData, data, setRawData }) => {

  const [categories, setCategories] = useState<string | string[]>('')
  const [clubs, setClubs] = useState<string | string[]>('')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [oldData, setoldData] = useState(data)
  const [inpu, setInpu] = useState('')

  const fetchData = async () => {
    setLoading(true)

    try {
      const params = new URLSearchParams()

      if (categories && categories.length > 0) {
        params.append(
          "categories",
          Array.isArray(categories) ? categories.join(",") : categories
        )
      }

      if (clubs && clubs.length > 0) {
        params.append("clubs", Array.isArray(clubs) ? clubs.join(",") : clubs)
      }

      if (from) params.append("from", new Date(from).toISOString().split("T")[0])
      if (to) params.append("to", new Date(to).toISOString().split("T")[0])

      const query = params.toString()
      const url = `${API_BASE_URL}/events/home${query ? `?${query}` : ""}`

      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) throw new Error("Error obteniendo los carruseles")

      const json = await res.json()
      setRawData(json)   // ✅ actualiza data original
      setData(json)      // ✅ actualiza data mostrada
    } catch (err: any) {
      console.error(err.message || "Ocurrió un error")
    } finally {
      setLoading(false)
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const filtered: Record<string, any[]> = {}
    setInpu(value)
    Object.entries(data).forEach(([key, events]) => {
      if (key === "trending") return
      filtered[key] = events.filter((event: any) =>
        event.name.toLowerCase().includes(value.toLowerCase())
      )
    })
    // mantenemos trending aunque no se busque
    setData(filtered)
  }

  const hasSomeThing = categories !== '' || clubs !== '' || from !== '' || to !== '';

  const back = () => {
    setInpu('')
    setCategories('')
    setClubs('')
    setFrom('')
    setTo('')
    setData(oldData)
  }

  return (
    <>
      <section className='flex md:hidden justify-center items-center w-full'>
        <div className="relative w-full">
          <input
            value={inpu}
            type="text"
            className="w-full grow rounded-lg bg-primary text-light py-3 px-4 pl-10"
            placeholder="Buscar partido por titulo"
            onChange={onChange}
          />
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <Image width={20} height={20} alt='Buscar' src='/icons/search.svg' />
          </div>
          {
            inpu &&
            <button
              type='button'
              onClick={() => { setInpu(''), setData(oldData) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <Image width={25} height={25} alt='Buscar' src='/icons/close.svg' />
            </button>
          }
        </div>
      </section>
      <section className='hidden md:flex flex-col justify-center items-center w-full gap-y-8'>
        <h1 className='font-semibold text-3xl'>Buscar partido</h1>
        <div className='w-3/4 xl:w-2/3 2xl:w-1/2 bg-primary/10 h-auto flex flex-col rounded-lg shadow-lg p-4 gap-y-4'>
          {/* Buscador */}
          <div className='w-full h-1/2 flex justify-between items-center gap-x-4'>
            <div className="relative w-full">
              <input
                value={inpu}
                type="text"
                className="w-full rounded-lg bg-primary text-light py-2 px-4"
                placeholder="Buscar partido por titulo"
                onChange={onChange}
              />
              {
                inpu &&
                <button
                  type='button'
                  onClick={() => { setInpu(''), setData(oldData) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  <Image width={25} height={25} alt='Buscar' src='/icons/close.svg' />
                </button>
              }
            </div>
            <CommonButton text="Buscar" type="primary" action={fetchData} />
            <CommonButton text="Restablecer" type="ghost" disabled={!hasSomeThing} action={back} />
          </div>
          {/* Dropdowns */}
          <div className='w-full h-1/2 flex justify-between items-center gap-x-4'>
            <Categories setCategories={setCategories} categories={categories} />
            <Clubs clubs={clubs} setClubs={setClubs} />
            <Calendar22 text='Desde' date={from} setDate={setFrom} />
            <Calendar22 text='Hasta' date={to} setDate={setTo} />
          </div>
        </div>
      </section>
    </>
  )
}

export default EventFilterDesktop
