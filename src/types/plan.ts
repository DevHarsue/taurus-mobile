export interface Plan {
  id: string;
  name: string;
  tier: string;
  durationDays: number;
  referencePrice: number;
  benefits: string[];
  isActive: boolean;
  isHighlighted?: boolean;
}
