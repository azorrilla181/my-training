import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { trpcResource } from '@fhss-web-team/frontend-utils';
import { TRPC_CLIENT } from '../../../utils/trpc.client';

@Component({
  selector: 'app-new-task',
  imports: [
    MatButtonModule, 
    MatIconModule,
    MatInputModule,
    MatFormField,
    FormsModule,
    MatDialogModule
  ],
  templateUrl: './new-task.component.html',
  styleUrl: './new-task.component.scss'
})
export class NewTaskComponent {
  protected readonly newTitle = signal('');
  protected readonly newDescription = signal('');

  private readonly trpc = inject(TRPC_CLIENT);
  protected readonly createTask = trpcResource(
    this.trpc.tasks.createTask.mutate,
    () => ({
      title: this.newTitle(),
      description: this.newDescription(),
    })
  )

  private readonly dialogRef = inject(MatDialogRef<NewTaskComponent>);
  protected async save() {
    if (await this.createTask.refresh()) {
      this.dialogRef.close(true);
    }
  }

  protected cancel() {
    this.dialogRef.close(false);
  }

  
}
