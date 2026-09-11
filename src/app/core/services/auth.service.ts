import { SupabaseService } from './supabase.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private supabase: SupabaseService
  ) {}

  async signInWithGoogle() {
    await this.supabase.client.auth.signInWithOAuth({
      provider: 'google'
    });
  }

  async signOut() {
    await this.supabase.client.auth.signOut();
  }

  async getUser() {
    return this.supabase.client.auth.getUser();
  }
}