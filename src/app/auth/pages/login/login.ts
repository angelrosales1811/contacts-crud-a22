import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  private authService = inject(AuthService);
  private router = inject(Router);
  
  ngOnInit(): void {
  this.authService.clearDemoMode();
}

  async loginWithGoogle() {
    this.authService.clearDemoMode();
    await this.authService.signInWithGoogle();
  }

  loginDemo(): void {
  this.authService.setDemoMode();

  this.router.navigate(['/']);
}
}