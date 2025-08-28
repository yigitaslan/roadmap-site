import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component/header.component';
import { BoardComponent } from './board/board.component/board.component';
import { RoadmapStore } from './state/roadmap.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, BoardComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  protected store = inject(RoadmapStore);
}