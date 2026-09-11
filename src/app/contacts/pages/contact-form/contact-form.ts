import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactsService } from '../../data-access/contacts.service';
@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private contactsService = inject(ContactsService);
  private formBuilder = inject(FormBuilder);

  form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [ Validators.email]],
    phone: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[0-9]+$/),
        Validators.maxLength(10)
        // Validators.minLength(10),
      ],
    ],
    description: [''],
  });

  contactId?: number;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.contactId = Number(id);

    const contact = await this.contactsService.getContactById(this.contactId);

    if (!contact) {
      this.router.navigate(['/']);
      return;
    }

    this.form.patchValue({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      description: contact.description,
    });

    this.form.controls.name.disable();
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    await this.contactsService.updateContact(this.contactId!, {
      name: this.form.get('name')?.value,
      email: this.form.get('email')?.value,
      phone: this.form.get('phone')?.value,
      description: this.form.get('description')?.value,
    });

    sessionStorage.setItem('selectedContactId', this.contactId?.toString() || '');
    this.router.navigate(['/']);
  }
  
  onlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;

    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }

    return true;
  }

  goBack(): void {
    sessionStorage.setItem('selectedContactId', this.contactId?.toString() || '');
    this.router.navigate(['/']);
  }
}
