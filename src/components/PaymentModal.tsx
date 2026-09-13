import React, { useState } from 'react';

export const PaymentModal = ({ amount, onClose }: { amount: number; onClose: () => void }) => {
  const [operator, setOperator] = useState('mpesa');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator, phone, amount }),
      });
      const data = await response.json();
      alert('Demande de paiement envoyée : ' + JSON.stringify(data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-modal">
      <h3>Choisissez votre mode de paiement</h3>
      <select value={operator} onChange={(e) => setOperator(e.target.value)}>
        <option value="mpesa">M-Pesa</option>
        <option value="orange">Orange Money</option>
        <option value="airtel">Airtel Money</option>
      </select>

      <input
        type="tel"
        placeholder="Numéro de téléphone (ex: 081...)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Traitement...' : `Payer ${amount} $`}
      </button>
      <button onClick={onClose}>Annuler</button>
    </div>
  );
};
