import { Injectable } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';
import { Contact } from '../models/contact.interface';

@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  constructor(private supabase: SupabaseService) {}

  async getContacts() {
    const { data, error } = await this.supabase.client.from('contacts').select('*').order('id');

    if (error) throw error;

    return data;
  }

  async createContact(contact: Contact) {
    const { error } = await this.supabase.client.from('contacts').insert(contact);

    if (error) throw error;
  }

  async deleteContact(id: number) {
    const { error } = await this.supabase.client.from('contacts').delete().eq('id', id);

    if (error) throw error;
  }
}
