import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { ContactsService } from '../../data-access/contacts.service';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './create.html',
  styleUrl: './create.scss',
})
export class Create {
  private fb = inject(FormBuilder);

  private contactsService = inject(ContactsService);

  private router = inject(Router);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.email]],
    phone: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[0-9]+$/),
        Validators.maxLength(10),
        // Validators.minLength(10),
      ],
    ],
    description: [''],
  });

  onlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;

    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }

    return true;
  }

  async save() {
    if (this.form.invalid) return;
    const contact = await this.contactsService.createContact(this.form.getRawValue() as any);

    sessionStorage.setItem('selectedContactId', contact.id.toString());

    this.router.navigate(['/contacts']);
  }
  toUpperCaseName(): void {
    const control = this.form.get('name');

    if (!control?.value) return;

    control.setValue(control.value.toUpperCase(), {
      emitEvent: false,
    });
  }

  toLowerCase(): void {
    const control = this.form.get('email');

    if (!control?.value) return;

    control.setValue(control.value.toLowerCase(), {
      emitEvent: false,
    });
  }
}
