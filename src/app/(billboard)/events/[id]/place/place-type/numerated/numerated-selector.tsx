import React from 'react'

const NumeratedSelector = ({ layout, stands, renderStand }) => {
  
  return (
    <div className="p-4 rounded-lg shadow flex flex-col md:bg-secondary">
      <h2 className="text-xl font-bold mb-4 text-light font-headline">Seleccionar sector</h2>
      <div className='w-full flex justify-center items-center'>
        <div className="aspect-w-16 aspect-h-12 rounded-md w-full">
          <svg viewBox={`0 0 ${layout.totalWidth} ${layout.totalHeight}`} width="100%" height="100%">
            <image
              href="/basket-pitch.jpg"
              x={layout.fieldX}
              y={layout.fieldY}
              width={400}
              height={250}
            />
            {stands.flatMap(renderStand)}
          </svg>
        </div>
      </div>

    </div>
  )
}

export default NumeratedSelector