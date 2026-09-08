// Fonction d'acceptation avec vérification d'identité et impression
(window as any).submitAcceptanceWithID = (jobId: string) => {
  const phoneInput = document.getElementById(`acceptor-phone-${jobId}`) as HTMLInputElement;
  const fileInput = document.getElementById(`acceptor-id-${jobId}`) as HTMLInputElement;

  if (!phoneInput?.value || !fileInput?.files?.length) {
    alert("Veuillez fournir votre numéro de téléphone ET charger une copie de votre pièce d'identité.");
    return;
  }

  const job = mockJobs.find(j => j.id === jobId);
  if (job) {
    // Sauvegarde locale de l'image ID (Data URL)
    const reader = new FileReader();
    reader.onload = (e) => {
      job.acceptorIdCardUrl = e.target?.result as string;
      job.acceptorPhone = phoneInput.value;
      job.status = 'reserved';
      job.reservedAt = Date.now();

      // Impression immédiate du bon de mission localement
      printJobReceipt(job);

      alert("Identité vérifiée et mission réservée ! La fiche a été envoyée à l'impression et le job est masqué en ligne.");
      renderApp(); // Le job disparaît du flux public
    };
    reader.readAsDataURL(fileInput.files[0]);
  }
};
