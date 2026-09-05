import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ContactsService } from '../../data-access/contacts.service';
import { Contact } from '../../models/contact.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

  private contactsService = inject(ContactsService);

  contacts = signal<Contact[]>([]);

  async ngOnInit() {
    await this.loadContacts();
  }

  async loadContacts() {

    const data =
      await this.contactsService.getContacts();

    this.contacts.set(data);

    console.log('DASHBOARD CONTACTS:', data);
  }

  async deleteContact(id?: number) {

    if (!id) return;

    await this.contactsService.deleteContact(id);

    await this.loadContacts();
  }
}