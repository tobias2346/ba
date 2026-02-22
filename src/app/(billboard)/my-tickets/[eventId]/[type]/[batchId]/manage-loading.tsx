import React from 'react'

const ManageLoading = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* Skeleton EventBuyTag */}
      <div className="w-full md:w-80 h-20 bg-gray-700 rounded-lg animate-pulse" />
      <div className="w-full md:w-80 h-20 bg-gray-700 rounded-lg animate-pulse" />
    </div>

  )
}

export default ManageLoading