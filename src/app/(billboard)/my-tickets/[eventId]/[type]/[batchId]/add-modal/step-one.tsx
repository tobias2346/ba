import React, { useState } from 'react';

const StepOne = ({ alias, setAlias, email, setEmail }) => {
  const [mode, setMode] = useState<'alias' | 'email'>('alias');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (mode === 'alias') {
      setAlias(value)
      setEmail('')
    }else { setEmail(value), setAlias('')} ;
  };

  const value = mode === 'alias' ? alias : email;
  const placeholder = mode === 'alias' ? 'ALIAS' : 'EMAIL';
  const inputType = mode === 'alias' ? 'text' : 'email';

  return (
    <div className="w-full flex flex-col gap-4">
      {/* --- Tab Bar --- */}
      <div className="flex  rounded-md p-1">
        {['alias', 'email'].map((tab) => (
          <button
            key={tab}
            type='button'
            onClick={() => setMode(tab as 'alias' | 'email')}
            className={`flex-1 py-2 text-sm font-medium transition-all
              ${mode === tab
                ? 'border-b border-primary text-white'
                : 'text-slate-400 hover:text-white'}`}
          >
            {tab === 'alias' ? 'Alias' : 'Email'}
          </button>
        ))}
      </div>

      {/* --- Input Field --- */}
      <input
        onChange={handleChange}
        value={value}
        name={mode}
        type={inputType}
        className="w-full bg-background text-white placeholder-slate-400 h-11 rounded-md px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
        placeholder={placeholder}
      />
    </div>
  );
};

export default StepOne;
