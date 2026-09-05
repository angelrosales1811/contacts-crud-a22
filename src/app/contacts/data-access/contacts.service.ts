import { Injectable } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';
import { Contact } from '../models/contact.interface';

@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  constructor(private supabase: SupabaseService) {}

  async getContacts() {
    const { data, error } = await this.supabase.client
      .from('contacts')
      .select('*')
      .eq('active', true)
      .order('id', { ascending: true });

    if (error) throw error;

    return data;
  }

  async createContact(contact: Contact) {
    const { error } = await this.supabase.client.from('contacts').insert(contact);

    if (error) throw error;
  }

  async deleteContact(id: number) {
    console.log('Eliminando contacto con ID:', id);
    const { error } = await this.supabase.client
      .from('contacts')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;
  }
}
