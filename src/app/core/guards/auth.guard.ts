import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

import { SupabaseService } from '../services/supabase.service';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const supabase = inject(SupabaseService);
  const authService = inject(AuthService);

  // Permitir acceso si está en modo demo
  if (authService.isDemoMode()) {
    return true;
  }

  // Verificar sesión de Supabase
  const {
    data: { session },
  } = await supabase.client.auth.getSession();

  if (session) {
    return true;
  }

  // Redirigir al login si no hay sesión ni modo demo
  return router.createUrlTree(['/login']);
};