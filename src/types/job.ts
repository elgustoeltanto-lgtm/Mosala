export interface Location {
  city: string;
  lat: number;
  lng: number;
  address?: string;
}

export interface Job {
  id: string;
  title: string;
  category: 'Animaux' | 'Nettoyage' | 'Cuisine' | 'Bricolage';
  description: string;
  price: number;
  location: Location;
  publisherPhone: string;     // Numéro du publiant
  acceptorPhone?: string;      // Numéro de l'exécuteur qui a accepté
  status: 'open' | 'reserved' | 'paid';
  reservedAt?: number;         // Timestamp pour l'expiration d'1 heure
  referrerId?: string;
}
