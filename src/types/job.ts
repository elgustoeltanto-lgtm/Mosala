export interface Job {
  id: string;
  title: string;
  category: 'Animaux' | 'Nettoyage' | 'Cuisine' | 'Bricolage';
  description: string;
  price: number;
  location: string;
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
