import { Component } from '@angular/core';
import { UserTableComponent } from '../../components/user-management/user-table/user-table.component';

@Component({
  selector: 'app-admin',
  imports: [UserTableComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {

}
