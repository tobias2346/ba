"use client"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import React from "react";

/**
 * Renders a shadcn/ui Dialog modal with dynamic children.
 * @param {boolean} open - State to control if the modal is open
 * @param {Function} setOpen - Function to set the modal open state
 * @param {React.ReactNode} children - Content to render inside the modal
 */

interface CommonModalProps {
  setOpen: (isOpen: boolean) => void;
  open : boolean;
  children : React.ReactNode
}

const CommonModal = ({ open = false, setOpen, children } : CommonModalProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="hidden"></DialogTitle>
      <DialogContent className="max-w-xs sm:max-w-sm px-4 py-10 rounded-lg border-none bg-dark">{children}</DialogContent>
    </Dialog>
  )
}

export default CommonModal

