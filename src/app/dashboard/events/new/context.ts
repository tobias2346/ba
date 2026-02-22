'use client';

import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode,
} from 'react';

// Puedes reemplazar `any` con una interfaz específica si sabes cómo es un `Policy`
type Policy = any;

interface PoliciesContextType {
  filteredData: Policy[];
  setFilteredData: Dispatch<SetStateAction<Policy[]>>;
  data: Policy[];
  setData: Dispatch<SetStateAction<Policy[]>>;
}

// Inicializa el contexto como undefined para forzar su uso dentro del provider
const PoliciesContext = createContext<PoliciesContextType | undefined>(undefined);

// Tipado correcto para children
interface PoliciesProviderProps {
  children: ReactNode;
}

export default function PoliciesProvider({ children }: PoliciesProviderProps) {
  const [filteredData, setFilteredData] = useState<Policy[]>([]);
  const [data, setData] = useState<Policy[]>([]);

  return (
    <PoliciesContext.Provider value={{ filteredData, setFilteredData, data, setData }}>
      {children}
    </PoliciesContext.Provider>
  );
}

// Hook para acceder al contexto de forma segura
export const usePoliciesContext = (): PoliciesContextType => {
  const context = useContext(PoliciesContext);
  if (!context) {
    throw new Error('usePoliciesContext must be used within a PoliciesProvider');
  }
  return context;
};
