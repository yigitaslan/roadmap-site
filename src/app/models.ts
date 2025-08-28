export type RequirementStatus = 'planned' | 'active' | 'done';

export interface Requirement {
  id: string;
  title: string;
  description?: string;
  decidedAt: string;
  startedAt?: string;
  completedAt?: string;
  status: RequirementStatus;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}