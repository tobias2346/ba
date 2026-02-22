

'use client';

import React, { useState, MouseEvent, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sector, StandDetail } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StadiumPreviewProps {
  standDetails: StandDetail[];
}

const standColors: { [key: string]: string } = {
  'E': '#ef4444',  // red-500
  'O': '#3b82f6', // blue-500
  'N': '#22c55e',  // green-500
  'S': '#f97316',    // orange-500
  'default': '#9ca3af' // gray-400
};

export function StadiumPreview({ standDetails }: StadiumPreviewProps) {
  const [zoomedStand, setZoomedStand] = useState<StandDetail | null>(null);
  const [zoomedSector, setZoomedSector] = useState<Sector | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const PADDING = 20;
  const FIELD_WIDTH = 400;
  const FIELD_HEIGHT = 250;
  const STAND_DEPTH = 50;
  const TRAY_GAP = 5;
  const CODO_SIZE = 60;


  const handleStandClick = (stand: StandDetail, e: MouseEvent<SVGGElement>) => {
    e.stopPropagation();
    if(stand.sectors.length === 1) {
        setZoomedSector(stand.sectors[0]);
    }
    setZoomedStand(stand);
  };
  const layout = useMemo(() => {
    let hasTray1N = false, hasTray2N = false, hasTray3N = false;
    let hasTray1S = false, hasTray2S = false, hasTray3S = false;
    let hasTray1E = false, hasTray2E = false, hasTray3E = false;
    let hasTray1W = false, hasTray2W = false, hasTray3W = false;
    let hasCodoNE = false, hasCodoSE = false, hasCodoNW = false, hasCodoSW = false;

    standDetails.forEach(s => {
      if (!s.orientation || !s.type) return;
      if (s.orientation === 'N') {
        if (s.type === '1_bandeja') hasTray1N = true;
        if (s.type === '2_bandeja') hasTray2N = true;
        if (s.type === '3_bandeja') hasTray3N = true;
      }
      if (s.orientation === 'S') {
        if (s.type === '1_bandeja') hasTray1S = true;
        if (s.type === '2_bandeja') hasTray2S = true;
        if (s.type === '3_bandeja') hasTray3S = true;
      }
      if (s.orientation === 'E') {
        if (s.type === '1_bandeja') hasTray1E = true;
        if (s.type === '2_bandeja') hasTray2E = true;
        if (s.type === '3_bandeja') hasTray3E = true;
        if (s.type === 'codo_norte') hasCodoNE = true;
        if (s.type === 'codo_sur') hasCodoSE = true;
      }
      if (s.orientation === 'O') {
        if (s.type === '1_bandeja') hasTray1W = true;
        if (s.type === '2_bandeja') hasTray2W = true;
        if (s.type === '3_bandeja') hasTray3W = true;
        if (s.type === 'codo_norte') hasCodoNW = true;
        if (s.type === 'codo_sur') hasCodoSW = true;
      }
    });

    const topOffset = PADDING + (hasTray3N ? STAND_DEPTH + TRAY_GAP : 0) + (hasTray2N ? STAND_DEPTH + TRAY_GAP : 0) + (hasTray1N ? STAND_DEPTH + PADDING : 0);
    const bottomOffset = PADDING + (hasTray3S ? STAND_DEPTH + TRAY_GAP : 0) + (hasTray2S ? STAND_DEPTH + TRAY_GAP : 0) + (hasTray1S ? STAND_DEPTH + PADDING : 0);
    const leftOffset = PADDING + (hasTray3W ? STAND_DEPTH + TRAY_GAP : 0) + (hasTray2W ? STAND_DEPTH + TRAY_GAP : 0) + (hasTray1W ? STAND_DEPTH + PADDING : 0);
    const rightOffset = PADDING + (hasTray3E ? STAND_DEPTH + TRAY_GAP : 0) + (hasTray2E ? STAND_DEPTH + TRAY_GAP : 0) + (hasTray1E ? STAND_DEPTH + PADDING : 0);
    
    const codoTopSpace = hasCodoNW || hasCodoNE ? CODO_SIZE + PADDING : 0;
    const codoBottomSpace = hasCodoSW || hasCodoSE ? CODO_SIZE + PADDING : 0;
    const codoLeftSpace = hasCodoNW || hasCodoSW ? CODO_SIZE + PADDING : 0;
    const codoRightSpace = hasCodoNE || hasCodoSE ? CODO_SIZE + PADDING : 0;

    const fieldX = leftOffset + codoLeftSpace;
    const fieldY = topOffset + codoTopSpace;

    const totalWidth = fieldX + FIELD_WIDTH + codoRightSpace + rightOffset + PADDING;
    const totalHeight = fieldY + FIELD_HEIGHT + codoBottomSpace + bottomOffset + PADDING;

    return {
      totalWidth,
      totalHeight,
      fieldX,
      fieldY,
      hasTray1N, hasTray1S, hasTray1E, hasTray1W,
      hasTray2N, hasTray2S, hasTray2E, hasTray2W,
    };
  }, [standDetails]);

  const renderStand = (stand: StandDetail) => {
    if (!stand || !stand.name || !stand.orientation || !stand.type || !Array.isArray(stand.sectors)) return null;
    const {
      fieldX,
      fieldY,
      hasTray1N, hasTray1S, hasTray1E, hasTray1W,
      hasTray2N, hasTray2S, hasTray2E, hasTray2W,
    } = layout;

    let x = 0, y = 0, width = 0, height = 0;
    let pathData = '';
    let textX, textY;

    if (stand.type.includes('bandeja')) {
      const isSecondTray = stand.type === '2_bandeja';
      const isThirdTray = stand.type === '3_bandeja';
      switch (stand.orientation) {
        case 'N':
          width = FIELD_WIDTH;
          height = STAND_DEPTH;
          x = fieldX;
          y = fieldY - PADDING - height - (isSecondTray ? TRAY_GAP + height : 0) - (isThirdTray ? (TRAY_GAP + height) * 2 : 0);
          break;
        case 'S':
          width = FIELD_WIDTH;
          height = STAND_DEPTH;
          x = fieldX;
          y = fieldY + FIELD_HEIGHT + PADDING + (isSecondTray && hasTray1S ? TRAY_GAP + STAND_DEPTH : 0) + (isThirdTray && hasTray2S ? (TRAY_GAP + STAND_DEPTH) * 2 : 0);
          break;
        case 'O':
          width = STAND_DEPTH;
          height = FIELD_HEIGHT;
          y = fieldY;
          x = fieldX - PADDING - width - (isSecondTray && hasTray1W ? TRAY_GAP + width : 0) - (isThirdTray && hasTray2W ? (TRAY_GAP + width) * 2 : 0);
          break;
        case 'E':
          width = STAND_DEPTH;
          height = FIELD_HEIGHT;
          y = fieldY;
          x = fieldX + FIELD_WIDTH + PADDING + (isSecondTray && hasTray1E ? TRAY_GAP + STAND_DEPTH : 0) + (isThirdTray && hasTray2E ? (TRAY_GAP + STAND_DEPTH) * 2 : 0);
          break;
      }
      textX = x + width / 2;
      textY = y + height / 2;
    }

    if (stand.type.startsWith('codo')) {
      const isNorth = stand.type === 'codo_norte';
      const codoBaseY = isNorth ? fieldY - PADDING - CODO_SIZE : fieldY + FIELD_HEIGHT + PADDING;
      const codoTopY = isNorth ? fieldY - PADDING : codoBaseY + CODO_SIZE;

      if (stand.orientation === 'O') {
        const codoBaseX = fieldX - PADDING - CODO_SIZE;
        const codoRightX = fieldX - PADDING;
        pathData = `M ${codoBaseX},${codoBaseY} H ${codoRightX} V ${codoTopY} L ${codoBaseX},${codoTopY} Z`;
      } else if (stand.orientation === 'E') {
        const codoBaseX = fieldX + FIELD_WIDTH + PADDING;
        const codoRightX = codoBaseX + CODO_SIZE;
        pathData = `M ${codoBaseX},${codoTopY} H ${codoRightX} V ${codoBaseY} L ${codoBaseX},${codoBaseY} Z`;
      }
      textX = fieldX + (stand.orientation === 'O' ? -PADDING - CODO_SIZE / 2 : FIELD_WIDTH + PADDING + CODO_SIZE / 2);
      textY = codoBaseY + CODO_SIZE / 2;
    }

    return (
      <g key={stand.id} onClick={e => handleStandClick(stand, e)} className="cursor-pointer group/stand">
        {stand.type.startsWith('codo') ? (
          <path d={pathData} fill={standColors[stand.orientation] || standColors.default} className="transition-all group-hover/stand:fill-opacity-80" />
        ) : (
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={standColors[stand.orientation] || standColors.default}
            rx="5"
            ry="5"
            className="transition-all group-hover/stand:fill-opacity-80"
          />
        )}
        <text
          x={textX}
          y={textY}
          textAnchor="middle"
          dy=".3em"
          fill="white"
          fontSize={12}
          fontWeight="bold"
          className="pointer-events-none"
        >
          {stand.name}
        </text>
      </g>
    );
  };

  const ZoomedSectorsView = () => {
    if (!zoomedStand) return null;
    const numSectors = zoomedStand.sectors.length;
    const gridColsClass = `md:grid-cols-${numSectors}`;
  
    return (
        <div className="p-2 flex flex-col h-full w-full ">
            <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" onClick={() => setZoomedStand(null)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Estadio
                </Button>
                <h3 className="font-semibold text-lg">{zoomedStand.name}</h3>
            </div>
            <div className={cn("flex-grow grid gap-2", `grid-cols-${numSectors}`)}>
                {zoomedStand.sectors.map(sector => (
                    <Button key={sector.id} onClick={() => setZoomedSector(sector)} className='h-full'>
                        {sector.name}
                    </Button>
                ))}
            </div>
        </div>
    );
  };

  const ZoomedRowsView = () => {
    if (!zoomedSector || !zoomedStand) return null;
    if (!isClient) return null;

    const MAX_VISIBLE_ROWS = 4;
    const SEAT_RADIUS_ZOOM = 20;
    const SEAT_DIAMETER_ZOOM = SEAT_RADIUS_ZOOM * 2;
    const ROW_GAP_ZOOM = 10;
    const ROW_HEIGHT_ZOOM = SEAT_DIAMETER_ZOOM + ROW_GAP_ZOOM;
    const SVG_PADDING_ZOOM = 20;

    const numRows = zoomedSector.rows.length;
    const maxSeats = Math.max(0, ...zoomedSector.rows.map(r => r.seatsCount));

    const contentWidth = maxSeats * SEAT_DIAMETER_ZOOM + Math.max(0, maxSeats - 1) * ROW_GAP_ZOOM + SVG_PADDING_ZOOM * 2;
    const contentHeight = numRows * ROW_HEIGHT_ZOOM + SVG_PADDING_ZOOM * 2;
    const containerHeight = Math.min(MAX_VISIBLE_ROWS * ROW_HEIGHT_ZOOM + SVG_PADDING_ZOOM * 2, contentHeight);

    return (
      <div className="p-2 flex flex-col h-full w-full">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" onClick={() => {
              if(zoomedStand && zoomedStand.sectors.length > 1) {
                  setZoomedSector(null)
              } else {
                  setZoomedStand(null);
                  setZoomedSector(null);
              }
          }}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
          <h3 className="font-semibold text-lg">{zoomedStand.name} - {zoomedSector.name}</h3>
        </div>

        <div className="flex-grow border rounded-md bg-muted/50 overflow-auto" style={{ height: `${containerHeight}px` }}>
          <svg width={contentWidth} height={contentHeight}>
            <g transform={`translate(${SVG_PADDING_ZOOM}, ${SVG_PADDING_ZOOM})`}>
              {zoomedSector.rows.map((row, rowIndex) => {
                const yPos = rowIndex * ROW_HEIGHT_ZOOM;
                return (
                  <g key={row.id} transform={`translate(0, ${yPos})`}>
                    {Array.from({ length: row.seatsCount }).map((_, seatIndex) => {
                      const xPos = seatIndex * (SEAT_DIAMETER_ZOOM + ROW_GAP_ZOOM);
                      const seatLabel = `${row.label}${seatIndex + 1}`;
                      return (
                        <g key={`${row.id}-${seatIndex}`} transform={`translate(${xPos}, 0)`}>
                          <circle
                            cx={SEAT_RADIUS_ZOOM}
                            cy={SEAT_RADIUS_ZOOM}
                            r={SEAT_RADIUS_ZOOM}
                            fill={standColors[zoomedStand.orientation || 'default'] || '#9ca3af'}
                            className="pointer-events-none"
                          />
                          <text
                            x={SEAT_RADIUS_ZOOM}
                            y={SEAT_RADIUS_ZOOM}
                            textAnchor="middle"
                            dy=".3em"
                            fill="white"
                            fontSize={SEAT_RADIUS_ZOOM * 0.7}
                            className="pointer-events-none font-bold select-none"
                          >
                            {seatLabel}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>
    );
  };
  
  if (zoomedSector) {
      return <ZoomedRowsView />;
  }

  if (zoomedStand) {
    return <ZoomedSectorsView />;
  }

  return (
    <div className="aspect-w-16 aspect-h-12 bg-muted/50 rounded-md p-2">
      <svg viewBox={`0 0 ${layout.totalWidth} ${layout.totalHeight}`} width="100%" height="100%">
        {isClient ? (
          <image
            href="/basket-pitch.jpg"
            x={layout.fieldX}
            y={layout.fieldY}
            width={FIELD_WIDTH}
            height={FIELD_HEIGHT}
          />
        ) : (
          <rect
            x={layout.fieldX}
            y={layout.fieldY}
            width={FIELD_WIDTH}
            height={FIELD_HEIGHT}
            fill="#4ade80"
            rx="10"
            ry="10"
          />
        )}
        {standDetails.map(renderStand)}
      </svg>
    </div>
  );
}
