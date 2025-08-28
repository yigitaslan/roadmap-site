import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoadmapStore } from '../../state/roadmap.store';
@Component({
  selector: 'app-requirement-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './requirement-form.component.html',
  styleUrls: ['./requirement-form.component.css'],
})
export class RequirementFormComponent {
  protected store = inject(RoadmapStore);

  title = '';
  description = '';
  decided = this.today();

  private today() {
    const d = new Date();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  reset() {
    this.title = '';
    this.description = '';
    this.decided = this.today();
  }

  save(e: Event) {
    e.preventDefault();
    const pid = this.store.selectedProjectId();
    if (!pid) return;
    if (!this.title.trim()) return;

    this.store.addRequirement(pid, {
      title: this.title.trim(),
      description: this.description.trim() || undefined,
      decidedAt: new Date(this.decided).toISOString(),
    });
    this.reset();
  }
}