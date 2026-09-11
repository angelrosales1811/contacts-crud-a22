import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  {
    path: 'login',
    loadComponent: () =>
      import('./auth/pages/login/login')
        .then(m => m.Login)
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./contacts/pages/dashboard/dashboard')
        .then(m => m.Dashboard)
  },

  {
    path: 'contacts/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./contacts/pages/create/create')
        .then(m => m.Create)
  },
  {
    path: 'contacts/new',
    loadComponent: () => import('./contacts/pages/create/create').then((m) => m.Create),
  },
  {
    path: 'contacts/update/:id',
    loadComponent: () =>
      import('./contacts/pages/contact-form/contact-form').then((m) => m.ContactForm),
  },
];
