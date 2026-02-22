export type ModalType = "assign" | "transfer" | "";

export interface ModalState {
  open: boolean;
  type: ModalType;
}

export const options: Record<
  Exclude<ModalType, "">,
  {
    title: string;
    description: string;
    inputPlaceholder?: string;
  }
> = {
  assign: {
    title: "Asignar evento",
    description:
      'Al asignar un ticket la persona asignada podrá ingresar al evento con su QR personal. También lo verá en "Mis tickets" de su perfil y podrá gestionarlo si es necesario.',
    inputPlaceholder: "Alias",
  },
  transfer: {
    title: "Transferir evento",
    description:
      'Al transferir un ticket perderás la propiedad y gestión del mismo. Dejarás de verlo en "Mis tickets" y no podrá ser reembolsado.',
  },
};
