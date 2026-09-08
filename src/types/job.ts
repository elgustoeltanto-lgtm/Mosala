export interface Location {
  city: string;
  lat: number;
  lng: number;
}

export interface Job {
  id: string;
  title: string;
  category: 'Animaux' | 'Nettoyage' | 'Cuisine' | 'Bricolage';
  description: string;
  price: number;
  location: Location;
  distance?: number;
  executorId?: string;
  referrerId?: string;
}

export interface PaymentBreakdown {
  totalAmount: number;
  platformFee: number;
  transferFee: number;
  referrerBonus: number;
  executorPayout: number;
}
