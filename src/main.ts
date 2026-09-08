import './style.css';
import { Job } from './types/job';
import { renderJobCard } from './components/JobCard';
import { renderPaymentModal } from './components/PaymentModal';
import { getUserCoordinates, calculateDistance } from './utils/geo';

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
      <h1>Service Market</h1>
      <button id="btn-geo" class="btn-geo">🎯 Trier par proximité</button>
    </header>
    <main class="job-grid">
      ${mockJobs.map(renderJobCard).join('')}
    </main>
    <div id="modal-container"></div>
  `;

  document.getElementById('btn-geo')?.addEventListener('click', async () => {
    try {
      const userCoords = await getUserCoordinates();
      
      mockJobs = mockJobs.map(job => ({
        ...job,
        distance: calculateDistance(userCoords.lat, userCoords.lng, job.location.lat, job.location.lng)
      }));

      mockJobs.sort((a, b) => (a.distance || 0) - (b.distance || 0));

      renderApp();
    } catch (err) {
      alert("Impossible de récupérer votre position : " + (err as Error).message);
    }
  });
}

renderApp();

(window as any).openPaymentModal = (jobId: string) => {
  const job = mockJobs.find(j => j.id === jobId);
  if (!job) return;
  
  const container = document.getElementById('modal-container')!;
  container.innerHTML = renderPaymentModal(job.price, Boolean(job.referrerId));
};

(window as any).closePaymentModal = () => {
  document.getElementById('modal-container')!.innerHTML = '';
};
