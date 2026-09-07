import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ContactsService } from '../../data-access/contacts.service';
import { Contact } from '../../models/contact.interface';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
2
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatMenuModule, MatBadgeModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private contactsService = inject(ContactsService);
  private router = inject(Router);

  contacts = signal<Contact[]>([]);
  openedLetter: string | null = null;
  searchTerm = signal('');
  removingContactId: number | null = null;
  async ngOnInit() {
    await this.loadContacts();
  }

  async loadContacts() {
    const contacts = await this.contactsService.getContacts();

    this.contacts.set(contacts);

    const selectedId = sessionStorage.getItem('selectedContactId');

    if (selectedId) {
      const contact = contacts.find((c) => c.id === Number(selectedId));

      if (contact) {
        setTimeout(() => {
          this.selectContact(contact);
        }, 100);
      }

      sessionStorage.removeItem('selectedContactId');
    }
  }

  async deleteContact(id?: number) {
    if (!id) return;

    // const confirmed = confirm('¿Estás seguro de eliminar este contacto?');

    // if (!confirmed) return;

    this.removingContactId = id;

    setTimeout(async () => {
      await this.contactsService.deleteContact(id);
      await this.loadContacts();
      this.removingContactId = null;
    }, 500);
  }

  updateContact(id: number): void {
    sessionStorage.setItem('selectedContact', id.toString());

    this.router.navigate(['/contacts/update', id]);
  }
  get contactsByLetter(): Record<string, any[]> {
    return this.contacts().reduce(
      (groups, contact) => {
        const letter = contact.name.charAt(0).toUpperCase();

        if (!groups[letter]) {
          groups[letter] = [];
        }

        groups[letter].push(contact);

        return groups;
      },
      {} as Record<string, any[]>,
    );
  }

  get letters(): string[] {
    return Object.keys(this.contactsByLetter).sort();
  }

  toggleAccordion(letter: string): void {
    this.openedLetter = this.openedLetter === letter ? null : letter;
  }
  filteredContacts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return [];
    }

    return this.contacts()
      .filter(
        (contact) =>
          contact.name.toLowerCase().includes(term) ||
          contact.email.toLowerCase().includes(term) ||
          contact.phone.includes(term),
      )
      .slice(0, 10);
  });

  selectContact(contact: Contact): void {
    this.searchTerm.set(contact.name);

    const letter = contact.name.charAt(0).toUpperCase();

    // abrir acordeón
    this.openedLetter = letter;

    // esperar a que Angular renderice
    setTimeout(() => {
      const element = document.getElementById(`contact-${contact.id}`);

      if (!element) return;

      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      element.classList.add('highlight-card');

      setTimeout(() => {
        element.classList.remove('highlight-card');
      }, 3000);
    });
    this.searchTerm.set('');
  }

  recoverContacts(): void {
    this.contactsService.recoverContacts().then(() => {
      this.loadContacts();
    });
  }
}
