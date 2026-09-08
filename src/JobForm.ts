// src/JobForm.ts ou dans votre composant React/Vue/TS
export function renderJobForm(onSubmit: (newJob: any) => void) {
  return `
    <form id="job-form">
      <input type="text" id="title" placeholder="Titre (ex: Nettoyage villa)" required />
      <input type="text" id="category" placeholder="Catégorie (ex: Nettoyage)" required />
      <input type="number" id="price" placeholder="Prix ($)" required />
      <input type="text" id="location" placeholder="Quartier (ex: Bel-Air)" required />
      <textarea id="description" placeholder="Description du job"></textarea>
      <button type="submit">Publier le job</button>
    </form>
  `;
}
document.querySelector('#job-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const newJob = {
    title: (document.querySelector('#title') as HTMLInputElement).value,
    category: (document.querySelector('#category') as HTMLInputElement).value,
    price: (document.querySelector('#price') as HTMLInputElement).value,
    location: (document.querySelector('#location') as HTMLInputElement).value,
    description: (document.querySelector('#description') as HTMLInputElement).value,
  };

  // Appelez votre fonction pour enregistrer en base de données ou rafraîchir l'interface
  addJobToUI(newJob);
});
