import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'contacts',
    pathMatch: 'full'
  },
  {
    path: 'contacts',
    loadComponent: () =>
      import('./contacts/pages/dashboard/dashboard')
        .then(m => m.Dashboard)
  },
  {
    path: 'contacts/new',
    loadComponent: () =>
      import('./contacts/pages/create/create')
        .then(m => m.Create)
  }
];