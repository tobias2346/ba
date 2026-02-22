"use client";

import React, { useState, createContext, useContext, ReactNode } from "react";

interface UIContextType {
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (isOpen: boolean) => void;
  isQrModalOpen: boolean;
  setIsQrModalOpen: (isOpen: boolean) => void;
  isVerifyModalOpen: boolean;
  setIsVerifyModalOpen: (isOpen: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

const UIProvider = ({ children }: { children: ReactNode }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const value: UIContextType = {
    isProfileModalOpen,
    setIsProfileModalOpen,
    isQrModalOpen,
    setIsQrModalOpen,
    isVerifyModalOpen,
    setIsVerifyModalOpen,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};

export { UIProvider };
