import React, { useState } from 'react';

export const PaymentModal = ({ amount, onClose }: { amount: number; onClose: () => void }) => {
  const [operator, setOperator] = useState('mpesa');
  const [clientPhone, setClientPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!clientPhone) {
      alert('Veuillez saisir votre numéro de téléphone.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/pay/mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_phone: clientPhone,
          operator: operator,
          amount: amount,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('📲 Veuillez vérifier votre téléphone pour valider votre code PIN !');
        onClose();
      } else {
        alert('Erreur: ' + (data.detail || 'Impossible d\'initier le paiement.'));
      }
    } catch (error) {
      console.error(error);
      alert('Erreur de connexion avec le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal-content">
        <h3>Paiement de frais</h3>
        <p>Montant : <strong>{amount} $</strong></p>

        <label>Sélectionnez votre réseau :</label>
        <select value={operator} onChange={(e) => setOperator(e.target.value)}>
          <option value="mpesa">Vodacom M-Pesa</option>
          <option value="orange">Orange Money</option>
          <option value="airtel">Airtel Money</option>
          <option value="africell">Africell Money</option>
        </select>

        <label>Votre numéro de téléphone :</label>
        <input
          type="tel"
          placeholder="Ex: 243820000000"
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
        />

        <div style={{ marginTop: '15px' }}>
          <button onClick={handlePayment} disabled={loading}>
            {loading ? 'Traitement en cours...' : 'Valider'}
          </button>
          <button onClick={onClose} style={{ marginLeft: '10px' }}>Annuler</button>
        </div>
      </div>
    </div>
  );
};
