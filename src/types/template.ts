export interface ImportTemplate {
  _id: string;
  name: string;
  description?: string;
  mapping: Record<string, string>;
  expectedHeaders: string[];
  userId: string;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateMatchResult {
  isPerfectMatch: boolean;
  missingHeaders: string[];
  extraHeaders: string[];
}
