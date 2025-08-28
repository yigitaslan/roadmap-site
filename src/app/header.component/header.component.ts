import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoadmapStore } from '../state/roadmap.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  protected store = inject(RoadmapStore);

  createProject() {
    const name = prompt('Proje adı:');
    if (name && name.trim().length > 0) this.store.addProject(name.trim());
  }

  renameProject() {
    const id = this.store.selectedProjectId();
    if (!id) return;
    const current = this.store.projects().find(p => p.id === id)?.name ?? '';
    const next = prompt('Yeni proje adı:', current);
    if (next !== null) this.store.renameProject(id, next);
  }

  deleteProject() {
    const id = this.store.selectedProjectId();
    if (!id) return;
    const name = this.store.projects().find(p => p.id === id)?.name ?? 'Seçili proje';
    if (confirm(`"${name}" projesini silmek istediğinize emin misiniz?\nBu işlem geri alınamaz.`)) {
      this.store.deleteProject(id);
    }
  }
}