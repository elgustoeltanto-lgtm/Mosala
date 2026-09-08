import { calculatePayout } from '../utils/payment';

export function renderPaymentModal(price: number, hasReferrer: boolean): string {
  const breakdown = calculatePayout(price, hasReferrer);

  return `
    <div id="modal-overlay" class="modal-overlay">
      <div class="modal-content">
        <h2>Paiement Mobile Money</h2>
        <div class="breakdown-box">
          <p><strong>Total à payer :</strong> ${breakdown.totalAmount} $</p>
          <hr />
          <p>• Exécuteur reçoit : <strong>${breakdown.executorPayout.toFixed(2)} $</strong></p>
          <p>• Frais plateforme (1%) : ${breakdown.platformFee.toFixed(2)} $</p>
          <p>• Frais de transfert (1%) : ${breakdown.transferFee.toFixed(2)} $</p>
          ${hasReferrer ? `<p>• Part du parrain (1%) : ${breakdown.referrerBonus.toFixed(2)} $</p>` : ''}
        </div>

        <form id="pay-form">
          <label>Opérateur :</label>
          <select id="operator" required>
            <option value="mpesa">M-Pesa</option>
            <option value="orange">Orange Money</option>
            <option value="airtel">Airtel Money</option>
          </select>

          <label>Téléphone :</label>
          <input type="tel" placeholder="+243..." required />

          <button type="submit" class="btn-submit">Valider le paiement</button>
          <button type="button" class="btn-close" onclick="window.closePaymentModal()">Annuler</button>
        </form>
      </div>
    </div>
  `;
}
