"use client"

import { useEffect, useState, useMemo } from "react"
import { cn } from "@/lib/utils"

interface BlockLoaderProps {
  messages?: string[]
  interval?: number
  className?: string
}

const GRID_SIZE = 4
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE

interface Block {
  id: number
  fromRow: number
  fromCol: number
  toRow: number
  toCol: number
  delay: number
  color: string
}

const BLOCK_COLORS = [
  "bg-primary",
  "bg-primary/80",
  "bg-primary/60",
  "bg-muted-foreground/50",
  "bg-muted-foreground/30",
]

function generateBlocks(seed: number): Block[] {
  const blocks: Block[] = []
  const activeCount = 6 + (seed % 4)

  for (let i = 0; i < activeCount; i++) {
    const fromIndex = (seed * 7 + i * 13) % TOTAL_CELLS
    let toIndex = (seed * 11 + i * 17 + 3) % TOTAL_CELLS
    if (toIndex === fromIndex) toIndex = (toIndex + 1) % TOTAL_CELLS

    blocks.push({
      id: i,
      fromRow: Math.floor(fromIndex / GRID_SIZE),
      fromCol: fromIndex % GRID_SIZE,
      toRow: Math.floor(toIndex / GRID_SIZE),
      toCol: toIndex % GRID_SIZE,
      delay: i * 0.12,
      color: BLOCK_COLORS[i % BLOCK_COLORS.length],
    })
  }

  return blocks
}

export function BlockLoader({
  messages,
  interval = 2000,
  className,
}: BlockLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length)
    }, interval)
    return () => clearInterval(msgTimer)
  }, [messages.length, interval])

  useEffect(() => {
    const cycleTimer = setInterval(() => {
      setCycle((prev) => prev + 1)
    }, 1800)
    return () => clearInterval(cycleTimer)
  }, [])

  const blocks = useMemo(() => generateBlocks(cycle), [cycle])

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-8",
        className
      )}
      role="status"
      aria-label="Loading"
    >
      {/* Grid container */}
      <div className="relative w-48 h-48 rounded-lg border border-border bg-muted/30 overflow-hidden">
        {/* Background grid lines */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
          {Array.from({ length: TOTAL_CELLS }).map((_, i) => (
            <div
              key={i}
              className="border border-border/30"
            />
          ))}
        </div>

        {/* Animated blocks */}
        {blocks.map((block) => {
          const size = 100 / GRID_SIZE

          return (
            <div
              key={`${cycle}-${block.id}`}
              className={cn(
                "absolute rounded-sm transition-none",
                block.color
              )}
              style={{
                width: `${size}%`,
                height: `${size}%`,
                left: `${block.fromCol * size}%`,
                top: `${block.fromRow * size}%`,
                animationName: `move-block-${cycle}-${block.id}`,
                animationDuration: "1.4s",
                animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                animationDelay: `${block.delay}s`,
                animationFillMode: "both",
                animationIterationCount: "1",
              }}
            >
              <style>{`
                @keyframes move-block-${cycle}-${block.id} {
                  0% {
                    left: ${block.fromCol * size}%;
                    top: ${block.fromRow * size}%;
                    opacity: 0;
                    transform: scale(0.3);
                  }
                  20% {
                    opacity: 1;
                    transform: scale(1);
                  }
                  50% {
                    left: ${block.toCol * size}%;
                    top: ${block.fromRow * size}%;
                  }
                  80% {
                    opacity: 1;
                    transform: scale(1);
                  }
                  100% {
                    left: ${block.toCol * size}%;
                    top: ${block.toRow * size}%;
                    opacity: 0.2;
                    transform: scale(0.8);
                  }
                }
              `}</style>
            </div>
          )
        })}

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary" />
      </div>

      {/* Message area */}
      <div className="flex flex-col items-center gap-3">
        <p
          key={messageIndex}
          className="text-sm font-medium text-foreground animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          {messages[messageIndex]}
        </p>

        {/* Dot indicators */}
        <div className="flex gap-1.5">
          {messages.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === messageIndex
                  ? "w-4 bg-primary"
                  : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>

        <span className="sr-only">Loading, please wait</span>
      </div>
    </div>
  )
}
