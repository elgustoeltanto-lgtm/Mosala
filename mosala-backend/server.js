import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const MPESA_URLS = {
  sandbox: 'https://api.sandbox.vm.co.mz:18352/ipg/v1x',
  production: 'https://api.mpesa.vm.co.mz/ipg/v1x'
};

const BASE_URL = MPESA_URLS[process.env.MPESA_ENV || 'sandbox'];

async function getMpesaToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  try {
    const response = await axios.get(`${BASE_URL}/auth/token`, {
      headers: { Authorization: `Basic ${auth}` }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Erreur Token M-Pesa:', error.response?.data || error.message);
    throw new Error('Impossible d\'obtenir le jeton M-Pesa.');
  }
}
app.post('/api/payments/flexpay', async (req, res) => {
  const { phone_number, amount, currency } = req.body;

  const FLEXPAY_TOKEN = process.env.FLEXPAY_TOKEN || 'votre_token_api';
  const MERCHANT_CODE = process.env.MERCHANT_CODE || 'votre_code_marchand';

  const payload = {
    merchant: MERCHANT_CODE,
    type: '1', // 1 = Mobile Money
    phone: phone_number,
    reference: `REF-${phone_number ? phone_number.slice(0, 5) : Date.now()}`,
    amount: amount,
    currency: currency || 'USD',
    callbackUrl: 'https://votre-domaine.com/api/payment/callback'
  };

  try {
    const response = await axios.post(
      'https://backend.flexpay.cd/api/rest/v1/paymentService',
      payload,
      {
        headers: {
          Authorization: `Bearer ${FLEXPAY_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 200) {
      return res.json({
        status: 'pending',
        message: 'Veuillez vérifier votre téléphone et saisir votre code PIN.'
      });
    } else {
      return res.status(400).json({ message: "Échec de l'initialisation du paiement." });
    }
  } catch (error) {
    console.error('Erreur FlexPay:', error.response?.data || error.message);
    return res.status(500).json({ message: 'Erreur lors du paiement FlexPay.' });
  }
});

app.post('/api/payments/stk-push', async (req, res) => {
  const { phoneNumber, amount, reference } = req.body;

  if (!phoneNumber || !amount) {
    return res.status(400).json({ success: false, message: 'Numéro et montant requis.' });
  }

  const formattedPhone = phoneNumber.replace('+', '').trim();

  try {
    const token = await getMpesaToken();

    const payload = {
      input_Amount: amount.toString(),
      input_CustomerMSISDN: formattedPhone,
      input_Country: 'DRC',
      input_Currency: 'USD',
      input_ServiceProviderCode: process.env.MPESA_SHORTCODE,
      input_ThirdPartyReference: reference || `MOSALA-${Date.now()}`,
      input_TransactionReference: reference || `MOSALA-${Date.now()}`
    };

    const response = await axios.post(`${BASE_URL}/c2bPayment/singleStage/`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.output_ResponseCode === 'INS-0') {
      return res.json({
        success: true,
        message: 'Demande envoyée ! Saisissez votre code PIN sur votre téléphone.',
        conversationID: response.data.output_ConversationID,
        transactionID: response.data.output_TransactionID
      });
    } else {
      return res.status(400).json({
        success: false,
        message: response.data.output_ResponseDesc || 'Échec du paiement.'
      });
    }
  } catch (error) {
    console.error('Erreur STK Push:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Erreur réseau Mobile Money.'
    });
  }
});
app.get('/', (req, res) => {
  res.send('Serveur API Mosala actif et opérationnel !');
});
app.listen(PORT, () => {
  console.log(`Serveur Backend Mosala actif sur http://localhost:${PORT}`);
});
