import { Component, model, output } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TaskStatus } from '../../../../../prisma/client';

@Component({
  selector: 'app-status-menu',
  imports: [MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './status-menu.component.html',
  styleUrl: './status-menu.component.scss',
})
export class StatusMenuComponent {
  readonly taskStatus = model.required<TaskStatus>();
  readonly taskChanged = output();

  protected async setStatus(newStatus: TaskStatus) {
    this.taskStatus.set(newStatus);
    this.taskChanged.emit();
  }
}
