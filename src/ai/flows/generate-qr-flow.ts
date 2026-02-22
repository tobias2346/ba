
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as jwt from 'jsonwebtoken';

const GenerateQrCodeInputSchema = z.object({
  alias: z.string().describe('El alias único del usuario.'),
});

const GenerateQrCodeOutputSchema = z.object({
  qrCodeUrl: z.string().optional().describe('La URL de la imagen del código QR generado.'),
  error: z.string().optional().describe('Un mensaje de error si la generación falla.'),
});

export type GenerateQrCodeInput = z.infer<typeof GenerateQrCodeInputSchema>;
export type GenerateQrCodeOutput = z.infer<typeof GenerateQrCodeOutputSchema>;


export async function generateQrCode(input: GenerateQrCodeInput): Promise<GenerateQrCodeOutput> {
    return generateQrCodeFlow(input);
}


const generateQrCodeFlow = ai.defineFlow(
  {
    name: 'generateQrCodeFlow',
    inputSchema: GenerateQrCodeInputSchema,
    outputSchema: GenerateQrCodeOutputSchema,
  },
  async (input) => {
    const { alias } = input;
    const secret = process.env.JWT_PRIVATE_KEY;

    if (!secret) {
        console.error('JWT_PRIVATE_KEY no está definida en las variables de entorno.');
        return { error: 'Error de configuración del servidor.' };
    }

    try {
        const payload = {
            alias: alias,
            expire: Date.now() + 5 * 60 * 1000, // 5 minutos desde ahora
        };

        const token = jwt.sign(payload, secret);

        const qrData = encodeURIComponent(token);
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrData}`;

        return { qrCodeUrl };

    } catch (error: any) {
        console.error("Error al generar el token o QR:", error);
        return { error: 'No se pudo generar el código QR en este momento.' };
    }
  }
);

    