import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ContactsService } from '../../data-access/contacts.service';
import { Contact } from '../../models/contact.interface';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private contactsService = inject(ContactsService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private supabase = inject(SupabaseService);
  contacts = signal<Contact[]>([]);
  openedLetter: string | null = null;
  searchTerm = signal('');
  removingContactId: number | null = null;
  async ngOnInit() {
    await this.loadContacts();
  }

  async loadContacts() {
    const {
      data: { session },
    } = await this.supabase.client.auth.getSession();

    console.log(session);

    try {
      const contacts = await this.contactsService.getContacts();
      console.log('CONTACTS:', contacts);
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
    } catch (error) {
      console.error('LOAD CONTACTS ERROR:', error);
    }
  }

  async deleteContact(id: number): Promise<void> {
    this.removingContactId = id;

    setTimeout(async () => {
      await this.contactsService.deleteContact(id);

      this.contacts.update((contacts) => contacts.filter((contact) => contact.id !== id));

      this.removingContactId = null;
    }, 400);
  }

  updateContact(id: number): void {
    sessionStorage.setItem('selectedContact', id.toString());

    this.router.navigate(['/contacts/update', id]);
  }
  get contactsByLetter(): Record<string, Contact[]> {
    return this.contacts().reduce(
      (groups, contact) => {
        const firstChar = contact.name.trim().charAt(0).toUpperCase();

        const key = /^[A-ZÁÉÍÓÚÑ]$/i.test(firstChar) ? firstChar : '#';

        if (!groups[key]) {
          groups[key] = [];
        }

        groups[key].push(contact);

        return groups;
      },
      {} as Record<string, Contact[]>,
    );
  }

  get letters(): string[] {
    return Object.keys(this.contactsByLetter).sort((a, b) => {
      if (a === '#') return -1;
      if (b === '#') return 1;

      return a.localeCompare(b);
    });
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

  async logout(): Promise<void> {
    await (this.authService as { signOut: () => Promise<void> }).signOut();
  }
}
