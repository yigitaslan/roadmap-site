import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoadmapStore } from '../../state/roadmap.store';
import { RequirementFormComponent } from '../requirement-form.component/requirement-form.component';
import { RequirementCardComponent } from '../requirement-card.component/requirement-card.component';

import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { Requirement } from '../../models';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, RequirementFormComponent, RequirementCardComponent, DragDropModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
})
export class BoardComponent {
  protected store = inject(RoadmapStore);

  onDrop(ev: CdkDragDrop<Requirement[]>) {
    const pid = this.store.selectedProjectId();
    if (!pid) return;

    // Kaynak ve hedef listeler
    const from = ev.previousContainer.id as 'planned' | 'active' | 'done';
    const to   = ev.container.id         as 'planned' | 'active' | 'done';

    // Sürüklenen veri
    const dragged = ev.item.data as Requirement | undefined;
    if (!dragged) return;

    // Farklı kolona taşındıysa statüyü güncelle
    if (from !== to) {
      this.store.move(pid, dragged.id, to);
    }

    // Statü güncellendikten sonra güncel listeleri oku
    const planned = this.store.planned();
    const active  = this.store.active();
    const done    = this.store.done();

    // İlgili statü listelerinin ID dizilerini oluştur
    const plannedIds = planned.map(r => r.id);
    const activeIds  = active.map(r => r.id);
    const doneIds    = done.map(r => r.id);

    // Hedef diziyi bul
    const idsArr = to === 'planned' ? plannedIds : to === 'active' ? activeIds : doneIds;

    // Öğeyi hedef listedeki currentIndex konumuna yerleştir
    const currPos = idsArr.indexOf(dragged.id);
    if (currPos !== -1) idsArr.splice(currPos, 1);
    let idx = ev.currentIndex;
    if (idx < 0) idx = 0;
    if (idx > idsArr.length) idx = idsArr.length;
    idsArr.splice(idx, 0, dragged.id);

    // Genel sıralamayı statü grupları olarak derle (Planlanan -> Aktif -> Tamamlanan)
    const orderedIds = [...plannedIds, ...activeIds, ...doneIds];
    this.store.reorderByIds(pid, orderedIds);
  }
}