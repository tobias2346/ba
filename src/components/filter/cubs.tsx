"use client"

import React, { useEffect, useState } from "react"
import CommonTagDropdown from "../common/common-tag-dropdown"
import { API_BASE_URL } from "@/services/enviroment"
import { toast } from "sonner"

const Clubs = ({clubs, setClubs}) => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const onSelect = (newClubId: string) => {
    const exist = clubs.includes(newClubId)
    if (exist) {
      setClubs(clubs.filter((i) => i !== newClubId))
    } else {
      setClubs([...clubs, newClubId])
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE_URL}/stores`)
        if (!res.ok) throw new Error("Error obteniendo los clubes")
        const d = await res.json()
        setData(d)
      } catch (error: any) {
        toast.error(error.message || "Error al cargar clubes")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <CommonTagDropdown
      text="Clubes"
      icon="/icons/club.svg"
      options={data}
      loading={loading}
      onSelect={onSelect}
    />
  )
}

export default Clubs
