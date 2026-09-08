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
      .order('name', { ascending: true });

    if (error) throw error;

    return data;
  }

  async createContact(contact: Contact) {
    const { data, error } = await this.supabase.client
      .from('contacts')
      .insert(contact)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async deleteContact(id: number) {
    const { error } = await this.supabase.client
      .from('contacts')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;
  }

  async updateContact(id: number, contact: Partial<Contact>) {
    const { error } = await this.supabase.client.from('contacts').update(contact).eq('id', id);
  }

  async getContactById(id: number) {
    const { data, error } = await this.supabase.client
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  }

  async recoverContacts() {
    const { error } = await this.supabase.client
      .from('contacts')
      .update({ active: true })
      .eq('active', false);

    if (error) throw error;
  }
}
