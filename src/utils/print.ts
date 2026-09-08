import type { Job } from '../types/job';

export function printJobReceipt(job: Job) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Fiche de Mission - Mosala - #${job.id}</title>
        <style>
          body { font-family: monospace; padding: 20px; }
          .header { border-bottom: 2px solid #000; padding-bottom: 10px; }
          .section { margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>👷‍♂️ Mosala - Bon de Mission</h2>
          <p>ID Mission : ${job.id}</p>
        </div>
        <div class="section">
          <p><strong>Titre :</strong> ${job.title}</p>
          <p><strong>Prix :</strong> ${job.price} $</p>
          <p><strong>Téléphone Publiant :</strong> ${job.publisherPhone}</p>
          <p><strong>Téléphone Exécuteur :</strong> ${job.acceptorPhone}</p>
        </div>
        <div class="section">
          <h3>📍 Localisation Exacte</h3>
          <p><strong>Adresse :</strong> ${job.location.address}</p>
          <p><strong>Coordonnées GPS :</strong> ${job.location.lat}, ${job.location.lng}</p>
        </div>
        <script>window.print();</script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
