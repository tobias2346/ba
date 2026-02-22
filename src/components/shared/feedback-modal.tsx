"use client"
import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"
import CommonButton, { CommonButtonType } from "../common/common-button"

// Define allowed modal types
type ModalType = 'info' | 'warning' | 'success' | 'error'

// Simple icon set (puedes reemplazar con SVGs personalizados si prefieres)
const iconMap: Record<ModalType, string> = {
  info: '/icons/info.svg',
  warning: '/icons/warning.svg',
  success: '/icons/success.svg',
  error: '/icons/failed.svg',
}

const modalFeedbackReact = (
  title: string,
  description: string,
  type: ModalType,
  dismissible?: boolean,
  EventsButtons?: CommonButtonType[],
) => {
  const modalContainer = document.createElement("div")
  document.body.appendChild(modalContainer)

  const closeModal = () => {
    setTimeout(() => {
      root.unmount()
      document.body.removeChild(modalContainer)
    }, 0)
  }

  const ModalComponent = () => {
    const [open, setOpen] = useState(true)

    useEffect(() => {
      if (!open) closeModal()
    }, [open])

    return (
      <Dialog open={open} onOpenChange={(open) => (dismissible ? setOpen(open) : null)}>
        <DialogContent className=" max-w-xs sm:max-w-sm flex flex-col justify-around items-center border-none bg-background">

          {/* Icon */}
          <Image src={iconMap[type]} alt="Icon" width={70} height={70} />

          <DialogTitle className="text-xl font-semibold ">{title}</DialogTitle>
          <DialogDescription className="text-base font-medium text-center text-slate-300">{description}</DialogDescription>

          <div className="w-full flex flex-wrap justify-center gap-2 ">
            {dismissible && <CommonButton
              text="Cerrar"
              type='ghost'
              action={closeModal}
            />}

            {EventsButtons?.map(({ text, action, type }) => (
              <CommonButton
                key={text}
                text={text}
                action={() => {
                  action!()
                  closeModal()
                }}
                type={type}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const root = createRoot(modalContainer)
  root.render(<ModalComponent />)
}

export default modalFeedbackReact


// const functionModal = () => modalFeedbackReact(
//   "Todo salió bien",
//   "Tu operación fue completada con éxito.",
//   "success",
//   true,
//   [
//     {
//       text: "Ver detalle",
//       action: () => console.log("Ver detalle"),
//       type: "primary",
//     }
//   ]
// )
