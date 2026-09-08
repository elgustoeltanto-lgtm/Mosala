export interface Location {
  city: string;
  address: string;
  lat: number;
  lng: number;
}

export interface Job {
  id: string;
  title: string;
  type: 'job' | 'business'; // Job ponctuel ou Commerce (Pizza, Garage...)
  category: 'Animaux' | 'Nettoyage' | 'Cuisine' | 'Bricolage' | 'Livraison' | 'Garage';
  description: string;
  price: number;
  publisherPhone: string;
  acceptorPhone?: string;
  acceptorIdCardUrl?: string; // Fichier ID uploadé
  location: Location;
  status: 'open' | 'reserved' | 'paid';
  reservedAt?: number;
}
