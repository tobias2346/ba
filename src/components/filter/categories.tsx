'use client'

import React, { useEffect, useState } from 'react'
import CommonTagDropdown from '../common/common-tag-dropdown'
import { API_BASE_URL } from '@/services/enviroment'
import { toast } from 'sonner'

const Categories = ({categories, setCategories}) => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const onSelect = (newCatId: string) => {
    const exist = categories.includes(newCatId)
    if (exist) {
      setCategories(categories.filter((i) => i !== newCatId))
    } else {
      setCategories([...categories, newCatId])
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE_URL}/stores/categories`)
        if (!res.ok) throw new Error('Error obteniendo categorías')
        const d = await res.json()
        setData(d)
      } catch (error: any) {
        toast.error(error.message || 'Error al cargar categorías')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <CommonTagDropdown
      text="Categorías"
      icon="/icons/club.svg"
      options={data}
      loading={loading}
      onSelect={onSelect}
    />
  )
}

export default Categories
