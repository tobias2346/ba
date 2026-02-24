import React from 'react'
import CommonButton from '../common/common-button'

const ShowMoreButton = ({array, visibleCount, action} : {array : any[], visibleCount : number, action : () => void}) => {
  return (
       <div className="flex justify-center">
          <CommonButton type="ghost" text={`Mostrar más eventos (+${array.length - visibleCount})`} action={action}>
          </CommonButton>
        </div>
  )
}

export default ShowMoreButton