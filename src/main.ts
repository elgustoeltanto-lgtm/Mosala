import './style.css';
import type { Job } from './types/job';
import { renderJobCard } from './components/JobCard';
import { renderPaymentModal } from './components/PaymentModal';
import { renderJobForm } from './JobForm';
import { getUserCoordinates, calculateDistance } from './utils/geo';

let currentMode: 'publish' | 'accept' = 'accept';

let mockJobs: Job[] = [
  {
    id: '1',
    title: 'Promener 2 chiens',
    category: 'Animaux',
    description: 'Balade de 1h au parc',
    price: 20,
    location: { city: 'Lubumbashi (Golf)', lat: -11.6608, lng: 27.4794 },
    referrerId: 'user_123'
  },
  {
    id: '2',
    title: 'Nettoyage complet villa',
    category: 'Nettoyage',
    description: 'Salon, cuisine et terrasse',
    price: 100,
    location: { city: 'Lubumbashi (Bel-Air)', lat: -11.6800, lng: 27.5000 }
  }
];

const app = document.querySelector<HTMLDivElement>('#app')!;

function renderApp() {
  app.innerHTML = `
    <header class="navbar">
      <div class="logo">
        <span class="logo-icon">👷‍♂️⛏️</span>
        <h1>Mosala</h1>
      </div>
      <div class="nav-actions">
        <button id="btn-mode-publish" class="btn-nav ${currentMode === 'publish' ? 'active' : ''}">Publier un travail</button>
        <button id="btn-mode-accept" class="btn-nav ${currentMode === 'accept' ? 'active' : ''}">Accepter un travail</button>
        <button id="btn-geo" class="btn-geo">🎯 Trier par proximité</button>
      </div>
    </header>

    <main class="main-layout">
      ${currentMode === 'publish' 
        ? `<section class="form-section">
             ${renderJobForm((newJob: Job) => {
               mockJobs.unshift(newJob);
               currentMode = 'accept';
               renderApp();
             })}
           </section>`
        : `<section class="job-grid">
             ${mockJobs.map(renderJobCard).join('')}
           </section>`
      }
    </main>

    <div id="modal-container"></div>
  `;

  // Événements de changement de mode
  document.getElementById('btn-mode-publish')?.addEventListener('click', () => {
    currentMode = 'publish';
    renderApp();
  });

  document.getElementById('btn-mode-accept')?.addEventListener('click', () => {
    currentMode = 'accept';
    renderApp();
  });

  // Événement de géolocalisation
  document.getElementById('btn-geo')?.addEventListener('click', async () => {
    try {
      const userCoords = await getUserCoordinates();
      mockJobs = mockJobs.map(job => ({
        ...job,
        distance: calculateDistance(userCoords.lat, userCoords.lng, job.location.lat, job.location.lng)
      }));
      mockJobs.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      currentMode = 'accept';
      renderApp();
    } catch (err) {
      alert("Impossible de récupérer votre position : " + (err as Error).message);
    }
  });
}

// Écouteur global pour ouvrir la modale de paiement depuis n'importe quelle carte
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target && target.classList.contains('btn-pay')) {
    const jobId = target.getAttribute('data-job-id');
    if (jobId) {
      const job = mockJobs.find(j => j.id === jobId);
      if (job) {
        const container = document.getElementById('modal-container')!;
        container.innerHTML = renderPaymentModal(job.price, Boolean(job.referrerId));
      }
    }
  }
});

(window as any).closePaymentModal = () => {
  const container = document.getElementById('modal-container');
  if (container) container.innerHTML = '';
};

renderApp();
