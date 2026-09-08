// src/api/mpesa.ts

export interface MpesaPaymentPayload {
  amount: number;
  phoneNumber: string; // Ex: 243810000000
  transactionRef: string;
}

export interface MpesaResponse {
  success: boolean;
  conversationID?: string;
  transactionID?: string;
  message: string;
}

// Config de Test / Sandbox Vodacom M-Pesa DRC
const MPESA_CONFIG = {
  baseUrl: 'https://api.sandbox.vm.co.mz:18352/ipg/v1x', // URL de test OpenAPI GSMA
  apiKey: 'VOTRE_CLE_API_SANDBOX',                     // À remplacer par votre clé développeur Vodacom
  publicKey: 'VOTRE_CLE_PUBLIQUE_RSA',
  serviceProviderCode: '171717'                         // Shortcode / Business ID de test
};

/**
 * Déclenche une demande de paiement (STK Push / C2B Payment)
 */
export async function initiateMpesaPayment(payload: MpesaPaymentPayload): Promise<MpesaResponse> {
  console.log(`[M-Pesa Sandbox] Démarrage du paiement de ${payload.amount} USD pour ${payload.phoneNumber}...`);

  try {
    // Note: En mode Sandbox local/développement, vous pouvez utiliser ce simulateur en attendant la clé réelle
    if (MPESA_CONFIG.apiKey === 'VOTRE_CLE_API_SANDBOX') {
      return await simulateMpesaSandbox(payload);
    }

    const response = await fetch(`${MPESA_CONFIG.baseUrl}/c2bPayment/singleStage/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MPESA_CONFIG.apiKey}`,
        'Origin': '*'
      },
      body: JSON.stringify({
        input_Amount: payload.amount.toString(),
        input_CustomerMSISDN: payload.phoneNumber.replace('+', ''),
        input_Country: 'DRC',
        input_Currency: 'USD',
        input_ServiceProviderCode: MPESA_CONFIG.serviceProviderCode,
        input_ThirdPartyReference: payload.transactionRef,
        input_TransactionReference: payload.transactionRef
      })
    });

    const data = await response.json();

    if (data.output_ResponseCode === 'INS-0') {
      return {
        success: true,
        conversationID: data.output_ConversationID,
        transactionID: data.output_TransactionID,
        message: 'Paiement effectué avec succès !'
      };
    } else {
      return {
        success: false,
        message: data.output_ResponseDesc || 'Échec de la transaction M-Pesa.'
      };
    }
  } catch (error) {
    console.error('Erreur API M-Pesa:', error);
    return {
      success: false,
      message: 'Erreur réseau lors de la connexion aux serveurs M-Pesa.'
    };
  }
}

/**
 * Simulation instantanée pour tester l'interface utilisateur en local
 */
function simulateMpesaSandbox(payload: MpesaPaymentPayload): Promise<MpesaResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        conversationID: `MPE-SANDBOX-${Date.now()}`,
        transactionID: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
        message: `[Simulateur Sandbox] Code PIN envoyé au ${payload.phoneNumber} pour ${payload.amount} USD.`
      });
    }, 1500);
  });
}
