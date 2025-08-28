import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Requirement } from '../../models';
import { RoadmapStore } from '../../state/roadmap.store';

@Component({
  selector: 'app-requirement-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './requirement-card.component.html',
  styleUrls: ['./requirement-card.component.css'],
})
export class RequirementCardComponent {
  @Input({ required: true }) req!: Requirement;
  protected store = inject(RoadmapStore);

date(iso?: string){
  if (!iso) return '';
  const d = new Date(iso);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
}

  start(){ this.move('active'); }
  complete(){ this.move('done'); }
  backToPlanned(){ this.move('planned'); }

  private move(to: 'planned'|'active'|'done'){
    const pid = this.store.selectedProjectId();
    if (!pid) return;
    this.store.move(pid, this.req.id, to);
  }

  remove(){
    const pid = this.store.selectedProjectId();
    if (!pid) return;
    if (confirm('Silmek istediğinize emin misiniz?')) {
      this.store.deleteRequirement(pid, this.req.id);
    }
  }
}