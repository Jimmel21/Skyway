import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface PassengerInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phoneNumber: string;
}

@Component({
  selector: 'app-passenger-info',
  templateUrl: './passenger-info.component.html',
  styleUrls: ['./passenger-info.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class PassengerInfoComponent implements OnInit {
  passengerForm: FormGroup;
  genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.passengerForm = this.fb.group({
      firstName: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z ]*$')
      ]],
      lastName: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z ]*$')
      ]],
      dateOfBirth: ['', [
        Validators.required,
        this.dateValidator
      ]],
      gender: ['', Validators.required],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$')
      ]]
    });
  }

  ngOnInit(): void {}

  dateValidator(control: any) {
    const today = new Date();
    const birthDate = new Date(control.value);
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (isNaN(birthDate.getTime())) {
      return { invalidDate: true };
    }
    
    if (age < 0 || age > 120) {
      return { invalidAge: true };
    }
    
    return null;
  }

  formatPhoneNumber(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 10) input = input.substr(0, 10);
    event.target.value = input;
  }

  onSubmit(): void {
    if (this.passengerForm.valid) {
      // Store passenger information and navigate to payment page
      const passengerInfo: PassengerInfo = this.passengerForm.value;
      console.log('Passenger information:', passengerInfo);
      this.router.navigate(['/payment']);
    } else {
      Object.keys(this.passengerForm.controls).forEach(key => {
        const control = this.passengerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  hasError(fieldName: string, errorType: string): boolean {
    const control = this.passengerForm.get(fieldName);
    return control?.touched && control?.hasError(errorType) || false;
  }
}