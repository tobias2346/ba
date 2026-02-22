// src/lib/address-helpers.ts

export type AddressObj = { description: string; place_id: string };

/** True si el valor parece ser { description, place_id } */
export function isAddressObject(v: unknown): v is AddressObj {
  return !!v && typeof v === "object" && "description" in (v as any) && "place_id" in (v as any);
}

/** Convierte string legacy u objeto a { description, place_id } */
export function toAddressObject(v: unknown): AddressObj {
  if (typeof v === "string") return { description: v, place_id: "" };
  if (isAddressObject(v)) {
    const d = String((v as any).description ?? "");
    const p = String((v as any).place_id ?? "");
    return { description: d, place_id: p };
  }
  return { description: "", place_id: "" };
}

/** Siempre devuelve un string apto para mostrar en UI */
export function getAddressText(v: unknown): string {
  if (typeof v === "string") return v;
  if (isAddressObject(v)) return String(v.description ?? "");
  return "";
}

    