import { Job } from '../types/job';

export function renderJobCard(job: Job): string {
  const distanceText = job.distance !== undefined ? `📍 ${job.location.city} (${job.distance} km)` : `📍 ${job.location.city}`;

  return `
    <div class="job-card" data-id="${job.id}">
      <div class="card-header">
        <span class="badge">${job.category}</span>
        <span class="price">${job.price} $</span>
      </div>
      <h3>${job.title}</h3>
      <p>${job.description}</p>
      <div class="card-footer">
        <small class="location-tag">${distanceText}</small>
        <button class="btn-pay" onclick="window.openPaymentModal('${job.id}')">Payer / Réserver</button>
      </div>
    </div>
  `;
}
