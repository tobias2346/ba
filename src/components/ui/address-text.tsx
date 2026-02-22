// src/components/address-text.tsx
"use client";

import React from "react";
import { getAddressText } from "@/lib/address-helpers";

type Props = { value: unknown; empty?: string };

/** Renderiza seguro la dirección (muestra description o vacío) */
export function AddressText({ value, empty = "" }: Props) {
  return <>{getAddressText(value) || empty}</>;
}

    