
'use client';

import { useState } from 'react';
import { PaymentMethodCard } from "./payment-method-card";
import { StripeLogo } from "./stripe-logo";
import { MercadoPagoLogo } from "./mercadopago-logo";
import { StripeConfigModal, MercadoPagoConfigModal } from './payment-modals';
import { useStores } from '@/contexts/stores-context';

interface ConfigPaymentStepProps {
    clubData: any;
    onUpdate: (updatedData: any) => void;
}

export function ConfigPaymentStep({ clubData, onUpdate }: ConfigPaymentStepProps) {
  const { updateStore } = useStores();
  const [isStripeModalOpen, setStripeModalOpen] = useState(false);
  const [isMercadoPagoModalOpen, setMercadoPagoModalOpen] = useState(false);

  const handleConfigure = (method: 'stripe' | 'mercadopago') => {
    if (method === 'stripe') {
        setStripeModalOpen(true);
    } else {
        setMercadoPagoModalOpen(true);
    }
  };

  const handleStripeSave = async (data: { publicKey: string; secretKey: string }) => {
    const payload = {
        paymentCredentials: {
            ...clubData.paymentCredentials,
            defaultProvider: clubData.paymentCredentials?.defaultProvider || 'stripe',
            currency: clubData.paymentCredentials?.currency || 'ARS',
            stripe: {
                publishableKey: data.publicKey,
                secretKey: data.secretKey,
                accountId: '',
            }
        }
    }
    const updatedStore = await updateStore(clubData.id, payload);
    if(updatedStore) {
        onUpdate(updatedStore);
    }
    setStripeModalOpen(false);
  };

  const handleMercadoPagoSave = async (data: { publicKey: string; accessToken: string, userId: string }) => {
    const payload = {
        paymentCredentials: {
             ...clubData.paymentCredentials,
            defaultProvider: clubData.paymentCredentials?.defaultProvider || 'mercadopago',
            currency: clubData.paymentCredentials?.currency || 'ARS',
            mercadopago: data
        }
    }
    const updatedStore = await updateStore(clubData.id, payload);
    if(updatedStore) {
        onUpdate(updatedStore);
    }
    setMercadoPagoModalOpen(false);
  };

  const isStripeConfigured = !!clubData.paymentCredentials?.stripe?.publishableKey;
  const isMercadoPagoConfigured = !!clubData.paymentCredentials?.mercadopago?.publicKey;

  return (
    <>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
<PaymentMethodCard
  name=""
  logo={<img src="/brands/stripe.png" alt="Stripe" className="h-10 object-contain" />}
  isConfigured={isStripeConfigured}
  onConfigure={() => handleConfigure("stripe")}
/>

<PaymentMethodCard
  name=""
  logo={<img src="/brands/mp.png" alt="Mercado Pago" className="h-10 object-contain" />}
  isConfigured={isMercadoPagoConfigured}
  onConfigure={() => handleConfigure("mercadopago")}
/>

      </div>

      <StripeConfigModal 
        isOpen={isStripeModalOpen}
        onClose={() => setStripeModalOpen(false)}
        onSave={handleStripeSave}
        initialData={clubData.paymentCredentials?.stripe}
      />
      <MercadoPagoConfigModal
        isOpen={isMercadoPagoModalOpen}
        onClose={() => setMercadoPagoModalOpen(false)}
        onSave={handleMercadoPagoSave}
        initialData={clubData.paymentCredentials?.mercadopago}
      />
    </>
  );
}
