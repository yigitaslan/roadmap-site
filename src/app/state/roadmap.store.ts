import { Injectable, computed, signal } from '@angular/core';
import { Project, Requirement, RequirementStatus } from '../models';

const LS = (k: string) => `roadmap.${k}`;

@Injectable({ providedIn: 'root' })
export class RoadmapStore {
  private _projects = signal<Project[]>(this._load<Project[]>('projects', []));
  private _selectedProjectId = signal<string | null>(
    this._load<string | null>('selectedProjectId', null)
  );
  private _requirements = signal<Record<string, Requirement[]>>(
    this._load('requirements', {})
  ); // key: projectId

  constructor() {
    this._ensureValidSelection();
  }

  readonly projects = computed(() => this._projects());
  readonly selectedProjectId = computed(() => this._selectedProjectId());
  readonly currentRequirements = computed(
    () => this._requirements()[this._selectedProjectId() ?? ''] ?? []
  );

  readonly planned = computed(() =>
    this.currentRequirements().filter((r) => r.status === 'planned')
  );
  readonly active = computed(() =>
    this.currentRequirements().filter((r) => r.status === 'active')
  );
  readonly done = computed(() =>
    this.currentRequirements().filter((r) => r.status === 'done')
  );

  selectProject(id: string | null) {
    this._selectedProjectId.set(id);
    this._persist('selectedProjectId', id);
  }

  addProject(name: string) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const proj: Project = { id, name, createdAt: now };
    this._projects.update((list) => [...list, proj]);
    this._persist('projects', this._projects());

    this._requirements.update((map) => ({ ...map, [id]: [] }));
    this._persist('requirements', this._requirements());

    this.selectProject(id);
  }

  renameProject(projectId: string, newName: string) {
    const name = newName.trim();
    if (!name) return;
    this._projects.update((list) =>
      list.map((p) => (p.id === projectId ? { ...p, name } : p))
    );
    this._persist('projects', this._projects());
  }

  deleteProject(projectId: string) {
    const wasSelected = this._selectedProjectId() === projectId;

    this._projects.update((list) => list.filter((p) => p.id !== projectId));
    this._persist('projects', this._projects());

    this._requirements.update((map) => {
      const { [projectId]: _removed, ...rest } = map;
      return rest;
    });
    this._persist('requirements', this._requirements());

    if (wasSelected) {
      const nextId = this._projects()[0]?.id ?? null;
      this.selectProject(nextId);
    } else {
      this._ensureValidSelection();
    }
  }

  addRequirement(projectId: string, req: Omit<Requirement, 'id' | 'status'>) {
    const r: Requirement = {
      ...req,
      id: crypto.randomUUID(),
      status: 'planned',
    };
    this._requirements.update((map) => ({
      ...map,
      [projectId]: [...(map[projectId] ?? []), r],
    }));
    this._persist('requirements', this._requirements());
  }

  move(projectId: string, id: string, to: RequirementStatus) {
    const patch: Partial<Requirement> = { status: to };
    const now = new Date().toISOString();
    if (to === 'active') patch.startedAt = now;
    if (to === 'done') patch.completedAt = now;
    if (to === 'planned') {
      patch.startedAt = undefined;
      patch.completedAt = undefined;
    }
    this._updateReq(projectId, id, patch);
  }

  deleteRequirement(projectId: string, id: string) {
    this._requirements.update((map) => ({
      ...map,
      [projectId]: (map[projectId] ?? []).filter((r) => r.id !== id),
    }));
    this._persist('requirements', this._requirements());
  }

  /* Drag&Drop sonrası projenin gereksinim sırasını, verilen ID dizisine göre günceller. */
  reorderByIds(projectId: string, orderedIds: string[]) {
    this._requirements.update((map) => {
      const existing = map[projectId] ?? [];
      const byId = new Map(existing.map((r) => [r.id, r]));

      const nextArr: Requirement[] = [];
      for (const id of orderedIds) {
        const r = byId.get(id);
        if (r) nextArr.push(r);
      }
      // orderedIds dışındaki kalanları sona ekle
      for (const r of existing) {
        if (!orderedIds.includes(r.id)) nextArr.push(r);
      }

      const next = { ...map, [projectId]: nextArr };
      this._persist('requirements', next);
      return next;
    });
  }

  private _updateReq(
    projectId: string,
    id: string,
    patch: Partial<Requirement>
  ) {
    this._requirements.update((map) => {
      const arr = (map[projectId] ?? []).map((r) =>
        r.id === id ? { ...r, ...patch } : r
      );
      const next = { ...map, [projectId]: arr };
      this._persist('requirements', next);
      return next;
    });
  }

  private _load<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(LS(key));
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private _persist(key: string, value: any) {
    try {
      localStorage.setItem(LS(key), JSON.stringify(value));
    } catch {}
  }

  /* Seçili proje yoksa veya artık mevcut değilse uygun bir id seç */
  private _ensureValidSelection() {
    const id = this._selectedProjectId();
    const exists = this._projects().some((p) => p.id === id);
    if (!exists) this.selectProject(this._projects()[0]?.id ?? null);
  }
}