import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { ContactsService } from '../../data-access/contacts.service';
import { Contact } from '../../models/contact.interface';
import { AuthService } from '../../../core/services/auth.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

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
  private readonly contactsService = inject(ContactsService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly supabase = inject(SupabaseService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  private readonly ANIMATION_DURATION = 400;

  contacts = signal<Contact[]>([]);
  searchTerm = signal('');

  openedLetter: string | null = null;
  removingContactId = signal<number | null>(null);

  async ngOnInit(): Promise<void> {
    await this.loadContacts();
  }

  async loadContacts(): Promise<void> {
    try {
      const contacts = await this.contactsService.getContacts();

      this.contacts.set(contacts);

      const selectedId = sessionStorage.getItem('selectedContactId');

      if (!selectedId) {
        return;
      }

      const contact = contacts.find((c) => c.id === Number(selectedId));

      if (contact) {
        setTimeout(() => this.selectContact(contact), 100);
      }

      sessionStorage.removeItem('selectedContactId');
    } catch (error) {
      console.error('LOAD CONTACTS ERROR:', error);
    }
  }

 async deleteContact(id: number): Promise<void> {
  try {
    this.removingContactId.set(id);

    await this.delay(300);

    await this.contactsService.deleteContact(id);

    this.contacts.update((contacts) =>
      contacts.filter((contact) => contact.id !== id),
    );

    this.snackBar.open('✅ Contacto eliminado', 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  } catch (error) {
    console.error('Error al eliminar contacto:', error);

    this.snackBar.open('❌ Contacto no eliminado', 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  } finally {
    this.removingContactId.set(null);
  }
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

        groups[key] ??= [];
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

    this.openedLetter = contact.name.charAt(0).toUpperCase();

    setTimeout(() => {
      const element = document.getElementById(`contact-${contact.id}`);

      if (!element) {
        return;
      }

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

  async recoverContacts(): Promise<void> {
    await this.contactsService.recoverContacts();

    await this.loadContacts();

    this.snackBar.open('✅ Contactos recuperados', 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  async logout(): Promise<void> {
    await this.authService.signOut();
  }

  copyToClipboard(value: string): void {
    navigator.clipboard.writeText(value);

    this.snackBar.open('📋 Copiado al portapapeles', 'Cerrar', {
      duration: 2000,
    });
  }

  confirmDelete(contact: Contact): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '350px',
      data: {
        title: 'Eliminar contacto',
        message: `¿Desea eliminar a ${contact.name}?`,
      },
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) {
        return;
      }

      await this.deleteContact(contact.id);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
