import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import { ContactsService } from '../../data-access/contacts.service';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create.html',
  styleUrl: './create.scss'
})
export class Create {

  private fb = inject(FormBuilder);

  private contactsService =
    inject(ContactsService);

  private router =
    inject(Router);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    description: ['']
  });

  async save() {

    if (this.form.invalid) return;

    await this.contactsService.createContact(
      this.form.getRawValue() as any
    );

    this.router.navigate(['/contacts']);
  }
}
