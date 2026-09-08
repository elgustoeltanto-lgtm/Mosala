export interface Location {
  city: string;
  address?: string; // Optionnel pour éviter les erreurs de type
  lat: number;
  lng: number;
}

export interface Job {
  id: string;
  title: string;
  type?: 'job' | 'business';
  category: 'Animaux' | 'Nettoyage' | 'Cuisine' | 'Bricolage' | 'Livraison' | 'Garage';
  description: string;
  price: number;
  publisherPhone: string;
  acceptorPhone?: string;
  acceptorIdCardUrl?: string;
  location: Location;
  distance?: number; // Déclaré pour JobCard.ts
  status: 'open' | 'reserved' | 'paid';
  reservedAt?: number;
  referrerId?: string;
}

export interface PaymentBreakdown {
  totalAmount: number;
  platformFee: number;
  transferFee: number;
  referrerBonus: number;
  executorPayout: number;
}
