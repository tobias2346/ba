"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Image from "next/image"

export function Calendar22({text, date, setDate}) {
  const [open, setOpen] = React.useState(false)

  const formattedDate = date ? date.toISOString().split("T")[0] : null

  return (
    <div className="flex flex-col gap-3 w-1/4 max-w-[25%]">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            className="flex justify-between items-center w-full h-14 p-4 ring-1 ring-primary/30 rounded-lg shadow gap-x-6 transition-all duration-300 bg-transparent truncate text-ellipsis font-semibold text-base hover:bg-primary/40"
          >
            {formattedDate || text}
          <Image
            src="/icons/arrow-down.svg"
            alt="arrow"
            width={20}
            height={20}
            className={`transition-transform duration-200 w-auto h-auto ${open ? 'rotate-180' : ''}`}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          onSelect={(date) => {
            setDate(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
    </div >
  )
}
