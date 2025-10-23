import {
  Component,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StatusMenuComponent } from '../status-menu/status-menu.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import {
  ConfirmationDialog,
  trpcResource,
} from '@fhss-web-team/frontend-utils';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TRPC_CLIENT } from '../../../utils/trpc.client';
import type { task, TaskStatus } from '../../../../../prisma/client';

@Component({
  selector: 'app-task-card',
  imports: [
    MatIconModule,
    StatusMenuComponent,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormField,
    FormsModule,
    DatePipe,
  ],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent {
  private readonly trpc = inject(TRPC_CLIENT);
  private readonly confirmation = inject(ConfirmationDialog);

  readonly initialTaskValue = input.required<task>();
  readonly taskDeleted = output();

  protected readonly newTitle = signal('');
  protected readonly newDescription = signal('');
  protected readonly newStatus = signal<TaskStatus>('Incomplete');

  protected readonly taskCardState = trpcResource(
    this.trpc.tasks.updateTask.mutate,
    () => ({
      taskId: this.initialTaskValue().id,
      // taskId: '-1', // test error responses
      newTitle: this.newTitle(),
      newDescription: this.newDescription(),
      newStatus: this.newStatus(),
    }),
    { valueComputation: () => this.initialTaskValue() }
  );

  protected readonly deleteResource = trpcResource(
    this.trpc.tasks.deleteTask.mutate,
    () => ({
      taskId: this.initialTaskValue().id,
      // taskId: '-1', // test error responses
    })
  );

  constructor() {
    effect(() => {
      const state = this.taskCardState.value();
      if (state) {
        this.newTitle.set(state.title);
        this.newDescription.set(state.description);
        this.newStatus.set(state.status);
      }
    });
  }

  protected readonly editMode = linkedSignal<boolean>(
    () => !!this.taskCardState.error()
  );

  private update(updates: Partial<task>) {
    this.taskCardState.value.update(prevTask => {
      if (prevTask === undefined) return undefined;
      return { ...prevTask, ...updates };
    });
    this.taskCardState.refresh();
  }

  protected save() {
    this.update({ title: this.newTitle(), description: this.newDescription() });
    this.toggleEditMode();
  }

  protected cancel() {
    this.newTitle.set(this.taskCardState.value()?.title ?? '');
    this.newDescription.set(this.taskCardState.value()?.description ?? '');
    this.toggleEditMode();
  }

  protected toggleEditMode() {
    this.editMode.update(prev => !prev);
  }

  protected deleteTask() {
    this.confirmation
      .open({ action: 'delete this task' })
      .afterClosed()
      .subscribe(async result => {
        if (result && (await this.deleteResource.refresh())) {
          this.taskDeleted.emit();
        }
      });
  }
}
