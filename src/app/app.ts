import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { SupabaseService } from './core/services/supabase.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private router = inject(Router);
  private supabase = inject(SupabaseService);

  constructor() {
    this.supabase.client.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          this.router.navigate(['/']);
        } else {
          this.router.navigate(['/login']);
        }
      }
    );
  }
}
