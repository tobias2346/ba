'use client'
import Image from 'next/image';
import React from 'react';

interface ManageTagProps {
  name: string;
  icon: string;
  description: string;
  action: () => void;
}

const ManageTag = ({ name, icon, description,action }: ManageTagProps) => {
  return (
    <button type='button' onClick={action} className="w-80 h-48 flex flex-col items-start bg-secondary rounded-xl p-4 gap-3 shadow transition-all duration-300 hover:bg-primary/20 cursor-pointer">
      <div className="flex flex-col items-start gap-3">
        <Image src={icon} alt={name} width={45} height={45} />
        <h4 className="text-lg font-semibold">{name}</h4>
      </div>
      <p className="text-sm text-slate-300 text-start">{description}</p>
    </button>
  );
};

export default ManageTag;
