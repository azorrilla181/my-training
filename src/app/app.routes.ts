import { Routes } from '@angular/router';
import { AuthErrorPage, ForbiddenPage, NotFoundPage, ServerErrorPage } from '@fhss-web-team/frontend-utils';
import { HomePage } from './pages/home/home.page';
import { DefaultLayout } from './layouts/default/default.layout';
import { Admin } from './pages/admin/admin';

export const routes: Routes = [
  {
    path: '',
    component: DefaultLayout,
    children: [
      { path: 'admin', component: Admin},
      { path: 'server-error', component: ServerErrorPage },
      { path: 'forbidden', component: ForbiddenPage },
      { path: 'auth-error', component: AuthErrorPage },
      { path: '', pathMatch: 'full', component: HomePage },
      { path: '**', component: NotFoundPage },
    ],
  },
];
