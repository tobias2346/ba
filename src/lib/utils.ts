import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses a date string in "dd/MM/yyyy HH:mm" format into a Date object.
 * @param dateString The date string to parse.
 * @returns A Date object, or null if the format is invalid.
 */
export function parseCustomDateString(dateString: string): Date | null {
  if (!dateString) return null;
  const parts = dateString.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
  if (!parts) return null;

  // parts[1] = day, parts[2] = month, parts[3] = year, parts[4] = hours, parts[5] = minutes
  const year = parseInt(parts[3], 10);
  const month = parseInt(parts[2], 10) - 1; // Month is 0-indexed in JS
  const day = parseInt(parts[1], 10);
  const hours = parseInt(parts[4], 10);
  const minutes = parseInt(parts[5], 10);

  const date = new Date(year, month, day, hours, minutes);
  // Basic validation
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  return date;
}
// data/stadiumtest.ts
export const stadiumtest = {
  name: 'MARIO DIAZ',
  stands: [
    {
      id: '1',
      name: 'Platea Destechada',
      orientation: 'N',
      type: '1_bandeja',
      sectors: [
        {
          id: 1,
          name: 'K',
          rows: [
            { id: 1, label: 'A', seatsCount: 40 },
            { id: 2, label: 'B', seatsCount: 40 }
          ]
        },
        {
          id: 12,
          name: 'K',
          rows: [
            { id: 1, label: 'A', seatsCount: 40 },
            { id: 2, label: 'B', seatsCount: 40 }
          ]
        },
        {
          id: 11,
          name: 'KA',
          rows: [
            { id: 1, label: 'A', seatsCount: 40 },
            { id: 2, label: 'B', seatsCount: 40 }
          ]
        }
      ]
    },
    {
      id: '2',
      name: 'Platea Techada',
      orientation: 'E',
      type: '1_bandeja',
      sectors: [
        {
          id: 92,
          name: 'M',
          rows: [
            { id: 3, label: 'A', seatsCount: 40 },
            { id: 4, label: 'B', seatsCount: 40 }
          ]
        }
      ]
    },
    {
      id: '23',
      name: 'Platea Techada',
      orientation: 'S',
      type: '1_bandeja',
      sectors: [
        {
          id: 2,
          name: 'M',
          rows: [
            { id: 3, label: 'A', seatsCount: 40 },
            { id: 4, label: 'B', seatsCount: 40 }
          ]
        },
        {
          id: 8562,
          name: 'Mdf',
          rows: [
            { id: 3, label: 'A', seatsCount: 40 },
            { id: 4, label: 'B', seatsCount: 40 }
          ]
        },
        {
          id: 258,
          name: 'M',
          rows: [
            { id: 3, label: 'A', seatsCount: 40 },
            { id: 4, label: 'B', seatsCount: 40 }
          ]
        }
      ]
    },
    {
      id: '52',
      name: 'Platea Techada',
      orientation: 'O',
      type: '1_bandeja',
      sectors: [
        {
          id: 42,
          name: 'M',
          rows: [
            { id: 3, label: 'A', seatsCount: 40 },
            { id: 4, label: 'B', seatsCount: 40 }
          ]
        },
        {
          id: 2322,
          name: 'WM',
          rows: [
            { id: 3, label: 'A', seatsCount: 40 },
            { id: 4, label: 'B', seatsCount: 40 }
          ]
        }
      ]
    }
  ]
}

/**
 * Formatea un monto según el país indicado.
 * 
 * @param amount - Monto numérico a formatear
 * @param country - País (argentina, uruguay, chile, brazil, estados unidos, españa)
 * @returns string - Ejemplo: "100 $ARS"
 */
export function formatCurrency(amount: number, country: string): string {
  const normalized = country.trim().toLowerCase();

  switch (normalized) {
    case "argentina":
      return `${amount.toLocaleString("es-AR")} $ARS`;
    case "uruguay":
      return `${amount.toLocaleString("es-UY")} $UYU`;
    case "chile":
      return `${amount.toLocaleString("es-CL")} $CLP`;
    case "brazil":
    case "brasil":
      return `${amount.toLocaleString("pt-BR")} R$ BRL`;
    case "estados unidos":
    case "usa":
    case "eeuu":
      return `${amount.toLocaleString("en-US")} $USD`;
    case "españa":
    case "espana":
      return `${amount.toLocaleString("es-ES")} €EUR`;
    default:
      return `${amount.toLocaleString()} $`;
  }
}
