import React from 'react'

const StepOne = ({ setAlias, alias }) => {

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setAlias(e.target.value)

  return (
    <input
      onChange={onChange}
      value={alias}
      name='alias'
      type="text"
      className="w-full bg-background text-white placeholder-slate-400 h-11 rounded-md px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
      placeholder='ALIAS'
    />
  )
}

export default StepOne