import type { Job } from './types/job';

export function renderJobForm(onSubmit: (newJob: Job) => void): string {
  setTimeout(() => {
    const form = document.getElementById('job-form') as HTMLFormElement | null;
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const titleInput = document.getElementById('job-title') as HTMLInputElement;
      const categoryInput = document.getElementById('job-category') as HTMLSelectElement;
      const priceInput = document.getElementById('job-price') as HTMLInputElement;
      const cityInput = document.getElementById('job-city') as HTMLInputElement;
      const descInput = document.getElementById('job-desc') as HTMLTextAreaElement;

      const newJob: Job = {
        id: Date.now().toString(),
        title: titleInput.value,
        category: categoryInput.value as Job['category'],
        price: Number(priceInput.value),
        location: {
          city: cityInput.value,
          lat: -11.6608,
          lng: 27.4794,
        },
        description: descInput.value,
      };

      onSubmit(newJob);
      form.reset();
    });
  }, 0);

  return `
    <form id="job-form" class="job-form">
      <h3>Poster une annonce</h3>
      
      <label for="job-title">Titre du travail :</label>
      <input type="text" id="job-title" placeholder="ex: Lavage de voiture" required />

      <label for="job-category">Catégorie :</label>
      <select id="job-category" required>
        <option value="Animaux">Animaux</option>
        <option value="Nettoyage">Nettoyage</option>
        <option value="Cuisine">Cuisine</option>
        <option value="Bricolage">Bricolage</option>
      </select>

      <label for="job-price">Prix ($) :</label>
      <input type="number" id="job-price" min="1" placeholder="25" required />

      <label for="job-city">Lieu / Quartier :</label>
      <input type="text" id="job-city" placeholder="ex: Lubumbashi (Golf)" required />

      <label for="job-desc">Description :</label>
      <textarea id="job-desc" placeholder="Détails de la tâche..." required></textarea>

      <button type="submit" class="btn-submit">Publier l'annonce</button>
    </form>
  `;
}
