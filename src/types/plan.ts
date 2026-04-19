// ─── Backend shape ─────────────────────────────────────────────────────────

export interface PlanBase {
  id: string;
  name: string;
  durationDays: number;
  referencePrice: number;
  isActive: boolean;
}

// ─── Frontend-enriched (PlansScreen usa tier, benefits, isHighlighted) ────

export interface Plan extends PlanBase {
  tier?: string;
  benefits?: string[];
  isHighlighted?: boolean;
}

// ─── Request DTOs ──────────────────────────────────────────────────────────

export interface CreatePlanRequest {
  name: string;
  durationDays: number;
  referencePrice?: number;
  isActive?: boolean;
}

export interface UpdatePlanRequest {
  name?: string;
  durationDays?: number;
  referencePrice?: number;
  isActive?: boolean;
}
