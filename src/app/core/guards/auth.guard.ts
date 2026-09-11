import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async () => {

  const router = inject(Router);
  const supabase = inject(SupabaseService);

  const {
    data: { session }
  } = await supabase.client.auth.getSession();

  if (session) {
    return true;
  }

  return router.createUrlTree(['/login']);
};