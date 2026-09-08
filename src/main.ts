import './style.css';
import type { Job } from './types/job';
import { renderJobForm } from './JobForm';
import { calculatePayout } from './utils/payment';
import { printJobReceipt } from './utils/print';

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
  },
  {
    id: '2',
    title: 'Lavage Auto Express & Polish',
    category: 'Garage',
    description: 'Lavage complet intérieur/extérieur avec cire de protection',
    price: 15,
    publisherPhone: '+243810000002',
    location: { city: 'Lubumbashi (Bel-Air)', address: 'Av. Kasavubu #45', lat: -11.6800, lng: 27.5000 },
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
    </header>

    <main class="content-container">
      ${currentMode === 'home' ? renderHomeView() : ''}
      ${currentMode === 'publish' ? renderPublishView() : ''}
      ${currentMode === 'accept' ? renderAcceptView() : ''}
    </main>
  `;

  document.getElementById('btn-home')?.addEventListener('click', () => { currentMode = 'home'; renderApp(); });
}

// 1. Page d'accueil épurée
function renderHomeView(): string {
  return `
    <div class="hero-landing">
      <div class="hero-card">
        <div class="hero-badge">👷‍♂️⛏️ MOSALA</div>
        <h2 class="hero-title">Services & Business en Temps Réel</h2>
        <p class="hero-subtitle">Publiez ou trouvez des opportunités de travail et commerces locaux.</p>
        
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

// 2. Vue Enregistrer
function renderPublishView(): string {
  const myJobs = mockJobs.filter(j => userPublisherPhone && j.publisherPhone === userPublisherPhone);

  return `
    <div class="publish-layout">
      <button class="btn-back" onclick="switchMode('home')">← Retour à l'accueil</button>
      
      ${renderJobForm((newJob) => {
        userPublisherPhone = newJob.publisherPhone;
        mockJobs.unshift(newJob);
        alert("Enregistrement réussi ! Votre offre/business est désormais visible.");
        switchMode('accept'); // Bascule directement sur la recherche
      })}

      <div class="my-jobs-panel">
        <h3>Mes enregistrements</h3>
        ${myJobs.length === 0 ? '<p class="empty-msg">Aucune annonce enregistrée pour ce numéro.</p>' : ''}
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

// 3. Vue Rechercher (Affiche tous les Business et Travaux disponibles)
function renderAcceptView(): string {
  const availableJobs = mockJobs.filter(j => j.status === 'open');

  return `
    <div class="accept-container">
      <button class="btn-back" onclick="switchMode('home')">← Retour à l'accueil</button>
      
      <div class="job-cards-grid">
        ${availableJobs.length === 0 ? '<p class="empty-msg">Aucun service ou business disponible pour le moment.</p>' : ''}
        ${availableJobs.map(job => `
          <div class="job-card">
            <div class="card-header">
              <span class="badge">${job.category}</span>
              <span class="price">${job.price} $</span>
            </div>
            <h3>${job.title}</h3>
            <p>${job.description}</p>
            <p class="phone-tag">📞 Contact : ${job.publisherPhone}</p>
            <p class="location-tag">📍 ${job.location.city}</p>
            
            <div class="accept-action">
              <input type="tel" id="acceptor-phone-${job.id}" placeholder="Votre N° de téléphone" required />
              <label for="acceptor-id-${job.id}">Copie Pièce d'identité (ID) :</label>
              <input type="file" id="acceptor-id-${job.id}" accept="image/*" required />
              <button class="btn-accept-job" onclick="submitAcceptanceWithID('${job.id}')">Réserver / Accepter</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

(window as any).switchMode = (mode: 'home' | 'publish' | 'accept') => {
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

      alert("Identité vérifiée et réservation effectuée ! Le bon a été imprimé et le service est désormais masqué en ligne.");
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
