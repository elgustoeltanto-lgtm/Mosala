import type { Job } from './types/job';
import { getUserCoordinates } from './utils/geo';

export function renderJobForm(onSubmit: (newJob: Job) => void): string {
  setTimeout(() => {
    const form = document.getElementById('job-form') as HTMLFormElement;
    const btnGeo = document.getElementById('btn-geo-fill');

    // Géolocalisation en 1 clic pour renforcer l'adresse
    btnGeo?.addEventListener('click', async () => {
      try {
        btnGeo.textContent = '⏳ Détection...';
        const coords = await getUserCoordinates();
        (document.getElementById('job-lat') as HTMLInputElement).value = coords.lat.toString();
        (document.getElementById('job-lng') as HTMLInputElement).value = coords.lng.toString();
        (document.getElementById('job-city') as HTMLInputElement).value = `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
        btnGeo.textContent = '✅ Position enregistrée';
      } catch (err) {
        alert("Erreur de géolocalisation : " + (err as Error).message);
        btnGeo.textContent = '📍 Détecter ma position exacte';
      }
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const newJob: Job = {
        id: Date.now().toString(),
        title: (document.getElementById('job-title') as HTMLInputElement).value,
        category: (document.getElementById('job-category') as HTMLSelectElement).value as Job['category'],
        price: Number((document.getElementById('job-price') as HTMLInputElement).value),
        publisherPhone: (document.getElementById('job-phone') as HTMLInputElement).value,
        location: {
          city: (document.getElementById('job-city') as HTMLInputElement).value,
          lat: Number((document.getElementById('job-lat') as HTMLInputElement).value) || -11.6608,
          lng: Number((document.getElementById('job-lng') as HTMLInputElement).value) || 27.4794,
        },
        description: (document.getElementById('job-desc') as HTMLTextAreaElement).value,
        status: 'open'
      };

      onSubmit(newJob);
    });
  }, 0);

  return `
    <form id="job-form" class="job-form">
      <h3>Publier un nouveau travail</h3>
      
      <input type="text" id="job-title" placeholder="Titre (ex: Lavage de voiture)" required />
      
      <select id="job-category" required>
        <option value="Animaux">🐶 Animaux</option>
        <option value="Nettoyage">🧹 Nettoyage</option>
        <option value="Cuisine">🍳 Cuisine</option>
        <option value="Bricolage">🛠️ Bricolage</option>
      </select>

      <input type="number" id="job-price" placeholder="Prix du travail ($)" min="1" required />
      <input type="tel" id="job-phone" placeholder="Votre numéro de téléphone (+243...)" required />

      <div class="geo-group">
        <input type="text" id="job-city" placeholder="Adresse ou quartier" required />
        <button type="button" id="btn-geo-fill" class="btn-secondary">📍 Détecter ma position exacte</button>
      </div>
      
      <input type="hidden" id="job-lat" />
      <input type="hidden" id="job-lng" />

      <textarea id="job-desc" placeholder="Description détaillée des tâches..." required></textarea>

      <button type="submit" class="btn-primary">Mettre en ligne</button>
    </form>
  `;
}
