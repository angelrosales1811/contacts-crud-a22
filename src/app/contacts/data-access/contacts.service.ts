import { Injectable } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';
import { Contact } from '../models/contact.interface';

@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  constructor(private supabase: SupabaseService) {}

  private async getCurrentUserId(): Promise<string> {
    const {
      data: { user },
    } = await this.supabase.client.auth.getUser();

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    return user.id;
  }

  async getContacts() {
    const userId = await this.getCurrentUserId();

    const { data, error } = await this.supabase.client
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) throw error;

    return data ?? [];
  }

  async createContact(contact: Contact) {
    const userId = await this.getCurrentUserId();

    const { data, error } = await this.supabase.client
      .from('contacts')
      .insert({
        ...contact,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async updateContact(id: number, contact: Partial<Contact>) {
    const userId = await this.getCurrentUserId();

    const { error } = await this.supabase.client
      .from('contacts')
      .update(contact)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async deleteContact(id: number) {
    const userId = await this.getCurrentUserId();

    const { error } = await this.supabase.client
      .from('contacts')
      .update({ active: false })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async getContactById(id: number) {
    const userId = await this.getCurrentUserId();

    const { data, error } = await this.supabase.client
      .from('contacts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return data;
  }

  async recoverContacts() {
    const userId = await this.getCurrentUserId();

    const { error } = await this.supabase.client
      .from('contacts')
      .update({ active: true })
      .eq('active', false)
      .eq('user_id', userId);

    if (error) throw error;
  }
}