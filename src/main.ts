import './style.css';
import type { Job } from './types/job';
import { renderJobForm } from './JobForm';
import { calculatePayout } from './utils/payment';
import { printJobReceipt } from './utils/print';

// States: 'home' for Landing Page, 'publish' for Enregistrer, 'accept' for Rechercher
let currentMode: 'home' | 'publish' | 'accept' = 'home';
let userPublisherPhone = '';

let mockJobs: Job[] = [
  {
    id: '1',
    title: 'Promener 2 chiens',
    category: 'Animaux',
    description: 'Balade de 1h au parc',
    price: 20,
    publisherPhone: '+243990000001',
    location: { city: 'Lubumbashi (Golf)', address: 'Lubumbashi (Golf)', lat: -11.6608, lng: 27.4794 },
    status: 'open'
  }
];

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
      <div class="brand" id="btn-home" style="cursor: pointer;">
        <span class="logo">👷‍♂️⛏️</span>
        <h1 class="title">Mosala</h1>
      </div>
      <nav class="nav-toggle">
        <button id="btn-publish" class="${currentMode === 'publish' ? 'active' : ''}">Enregistrer</button>
        <button id="btn-accept" class="${currentMode === 'accept' ? 'active' : ''}">Rechercher</button>
      </nav>
    </header>

    <main class="content-container">
      ${currentMode === 'home' ? renderHomeView() : ''}
      ${currentMode === 'publish' ? renderPublishView() : ''}
      ${currentMode === 'accept' ? renderAcceptView() : ''}
    </main>
  `;

  // Event Listeners
  document.getElementById('btn-home')?.addEventListener('click', () => { currentMode = 'home'; renderApp(); });
  document.getElementById('btn-publish')?.addEventListener('click', () => { currentMode = 'publish'; renderApp(); });
  document.getElementById('btn-accept')?.addEventListener('click', () => { currentMode = 'accept'; renderApp(); });
}

// 1. Landing Page View (Clean & Avant-Garde)
function renderHomeView(): string {
  return `
    <div class="hero-landing">
      <div class="hero-card">
        <div class="hero-badge">👷‍♂️⛏️ MOSALA</div>
        <h2 class="hero-title">Services & Business en Temps Réel</h2>
        <p class="hero-subtitle">Publiez ou trouvez des opportunités de travail locales en un clic.</p>
        
        <div class="hero-actions">
          <button class="btn-hero btn-hero-primary" onclick="switchMode('publish')">
            <span class="icon">➕</span>
            <span class="text">Enregistrer Un Business / Travail</span>
          </button>

          <button class="btn-hero btn-hero-secondary" onclick="switchMode('accept')">
            <span class="icon">🔍</span>
            <span class="text">Rechercher Un Business / Travail</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

// 2. Publish / Enregistrer View
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
        <h3>Mes annonces enregistrées</h3>
        ${myJobs.length === 0 ? '<p class="empty-msg">Aucune annonce publiée pour ce numéro.</p>' : ''}
        ${myJobs.map(job => `
          <div class="my-job-card">
            <h4>${job.title} - ${job.price} $</h4>
            <p>Statut : <strong>${job.status === 'open' ? 'En attente' : job.status === 'reserved' ? 'Réservé' : 'Payé'}</strong></p>
            
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

// 3. Accept / Rechercher View
function renderAcceptView(): string {
  const availableJobs = mockJobs.filter(j => j.status === 'open');

  return `
    <div class="job-cards-grid">
      ${availableJobs.length === 0 ? '<p>Aucun service disponible pour le moment.</p>' : ''}
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
            <input type="tel" id="acceptor-phone-${job.id}" placeholder="Votre N° de téléphone" required />
            <label for="acceptor-id-${job.id}">Pièce d'identité (ID) :</label>
            <input type="file" id="acceptor-id-${job.id}" accept="image/*" required />
            <button class="btn-accept-job" onclick="submitAcceptanceWithID('${job.id}')">Accepter ce travail</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Global actions
(window as any).switchMode = (mode: 'publish' | 'accept') => {
  currentMode = mode;
  renderApp();
};

(window as any).submitAcceptanceWithID = (jobId: string) => {
  const phoneInput = document.getElementById(`acceptor-phone-${jobId}`) as HTMLInputElement;
  const fileInput = document.getElementById(`acceptor-id-${jobId}`) as HTMLInputElement;

  if (!phoneInput?.value || !fileInput?.files?.length) {
    alert("Veuillez fournir votre numéro de téléphone ET charger une copie de votre pièce d'identité.");
    return;
  }

  const job = mockJobs.find((j: Job) => j.id === jobId);
  if (job) {
    const reader = new FileReader();
    reader.onload = (e) => {
      job.acceptorIdCardUrl = e.target?.result as string;
      job.acceptorPhone = phoneInput.value;
      job.status = 'reserved';
      job.reservedAt = Date.now();

      printJobReceipt(job);

      alert("Identité vérifiée et mission réservée ! La fiche a été imprimée et le travail a été masqué en ligne.");
      renderApp();
    };
    reader.readAsDataURL(fileInput.files[0]);
  }
};

(window as any).triggerSTKPush = (jobId: string) => {
  const job = mockJobs.find((j: Job) => j.id === jobId);
  if (!job) return;

  const breakdown = calculatePayout(job.price, Boolean(job.referrerId));

  alert(`Demande de paiement envoyée !
  
Un code PIN Mobile Money a été envoyé sur votre téléphone (${job.publisherPhone}).
• Montant : ${job.price} $
• Répartition : Exécuteur (${breakdown.executorPayout.toFixed(2)} $) | Frais (${breakdown.platformFee.toFixed(2)} $)`);

  job.status = 'paid';
  renderApp();
};

renderApp();
