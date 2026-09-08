import './style.css';
import type { Job } from './types/job';
import { renderJobForm } from './JobForm';
import { calculatePayout } from './utils/payment';

let currentMode: 'publish' | 'accept' = 'accept';
let userPublisherPhone = ''; // Stocke le numéro de l'utilisateur s'il publie

let mockJobs: Job[] = [
  {
    id: '1',
    title: 'Promener 2 chiens',
    category: 'Animaux',
    description: 'Balade de 1h au parc',
    price: 20,
    publisherPhone: '+243990000001',
    location: { city: 'Lubumbashi (Golf)', lat: -11.6608, lng: 27.4794 },
    status: 'open'
  }
];

// Vérification de la règle de réinstallation (1 heure = 3600000 ms)
function checkExpirations() {
  const now = Date.now();
  mockJobs.forEach(job => {
    if (job.status === 'reserved' && job.reservedAt && (now - job.reservedAt > 3600000)) {
      job.status = 'open';
      delete job.acceptorPhone;
      delete job.reservedAt;
    }
  });
}

const app = document.querySelector<HTMLDivElement>('#app')!;

function renderApp() {
  checkExpirations();

  app.innerHTML = `
    <header class="navbar-avantgarde">
      <div class="brand">
        <span class="logo">👷‍♂️⛏️</span>
        <h1 class="title">Mosala</h1>
      </div>
      <nav class="nav-toggle">
        <button id="btn-publish" class="${currentMode === 'publish' ? 'active' : ''}">Publier un travail</button>
        <button id="btn-accept" class="${currentMode === 'accept' ? 'active' : ''}">Accepter un travail</button>
      </nav>
    </header>

    <main class="content-container">
      ${currentMode === 'publish' ? renderPublishView() : renderAcceptView()}
    </main>
  `;

  // Événements de navigation
  document.getElementById('btn-publish')?.addEventListener('click', () => { currentMode = 'publish'; renderApp(); });
  document.getElementById('btn-accept')?.addEventListener('click', () => { currentMode = 'accept'; renderApp(); });
}

// Vue "Publier un travail" (Formulaire + Suivi de mes publications)
function renderPublishView(): string {
  const myJobs = mockJobs.filter(j => userPublisherPhone && j.publisherPhone === userPublisherPhone);

  return `
    <div class="publish-layout">
      ${renderJobForm((newJob) => {
        userPublisherPhone = newJob.publisherPhone;
        mockJobs.unshift(newJob);
        renderApp();
      })}

      <div class="my-jobs-panel">
        <h3>Mes annonces publiées</h3>
        ${myJobs.length === 0 ? '<p class="empty-msg">Aucune annonce publiée pour ce numéro.</p>' : ''}
        ${myJobs.map(job => `
          <div class="my-job-card">
            <h4>${job.title} - ${job.price} $</h4>
            <p>Statut : <strong>${job.status === 'open' ? 'En attente d\'un exécutant' : job.status === 'reserved' ? 'Réservé' : 'Payé'}</strong></p>
            
            ${job.status === 'reserved' ? `
              <div class="acceptor-info-box">
                <p>📞 Exécuteur : <strong>${job.acceptorPhone}</strong></p>
                <button class="btn-pay-now" onclick="triggerSTKPush('${job.id}')">Payer Maintenant</button>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Vue "Accepter un travail" (Liste des jobs ouverts)
function renderAcceptView(): string {
  const availableJobs = mockJobs.filter(j => j.status === 'open');

  return `
    <div class="job-cards-grid">
      ${availableJobs.length === 0 ? '<p>Aucun travail disponible pour le moment.</p>' : ''}
      ${availableJobs.map(job => `
        <div class="job-card">
          <div class="card-header">
            <span class="badge">${job.category}</span>
            <span class="price">${job.price} $</span>
          </div>
          <h3>${job.title}</h3>
          <p>${job.description}</p>
          <p class="phone-tag">📞 Publiant : ${job.publisherPhone}</p>
          <p class="location-tag">📍 ${job.location.city}</p>
          
          <div class="accept-action">
            <input type="tel" id="acceptor-phone-${job.id}" placeholder="Votre N° de téléphone" />
            <button class="btn-accept-job" onclick="acceptJob('${job.id}')">Accepter ce travail</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Actions globales
(window as any).acceptJob = (jobId: string) => {
  const input = document.getElementById(`acceptor-phone-${jobId}`) as HTMLInputElement;
  if (!input || !input.value) {
    alert("Veuillez entrer votre numéro de téléphone pour réserver le travail.");
    return;
  }

  const job = mockJobs.find(j => j.id === jobId);
  if (job) {
    job.status = 'reserved';
    job.acceptorPhone = input.value;
    job.reservedAt = Date.now();
    alert("Travail réservé ! Le publiant a reçu vos coordonnées pour déclencher le paiement.");
    renderApp();
  }
};

(window as any).triggerSTKPush = (jobId: string) => {
  const job = mockJobs.find(j => j.id === jobId);
  if (!job) return;

  const breakdown = calculatePayout(job.price, Boolean(job.referrerId));

  alert(` Demande de paiement envoyée !
  
Un code PIN Mobile Money a été envoyé sur votre téléphone (${job.publisherPhone}).
• Montant : ${job.price} $
• Répartition : Exécuteur (${breakdown.executorPayout.toFixed(2)} $) | Frais (${breakdown.platformFee.toFixed(2)} $)

Veuillez valider le code PIN sur votre téléphone pour finaliser le contrat.`);

  job.status = 'paid';
  renderApp();
};

renderApp();
