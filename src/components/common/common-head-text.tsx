import React from 'react'

interface HeadTextProps {
  head : string,
  description: string
}

const HeadText = ({head , description} : HeadTextProps) => {
  return (
    <div >
      <h3 className="text-sm text-primary">{head}</h3>
      <span className="text-sm overflow-hidden text-ellipsis">{description}</span>
    </div>
  )
}

export default HeadText