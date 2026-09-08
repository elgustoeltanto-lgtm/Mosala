export interface Location {
  lat: number;
  lng: number;
  city: string;
}

export interface Job {
  id: string;
  title: string;
  category: 'Animaux' | 'Nettoyage' | 'Cuisine' | 'Bricolage';
  description: string;
  price: number;
  location: Location;
  distance?: number; // Calculé dynamiquement en km
  executorId?: string;
  referrerId?: string;
}
