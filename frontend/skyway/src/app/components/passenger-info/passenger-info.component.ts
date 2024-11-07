import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Flight } from '../../services/airport.service';

interface FlightSelection {
  flight: Flight;
  returnFlight?: Flight | null;
  searchDetails?: any;
  totalPrice: number;
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
  selectedFlights: FlightSelection | null = null;
  genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as FlightSelection;

    if (state) {
      this.selectedFlights = state;
    } else {
      // If no flight data, redirect back to search
      this.router.navigate(['/']);
    }

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

  ngOnInit(): void {
    // If no flight data was passed, redirect to search page
    if (!this.selectedFlights) {
      this.router.navigate(['/']);
    }
  }

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

  onSubmit(): void {
    if (this.passengerForm.valid && this.selectedFlights) {
      const passengerInfo = this.passengerForm.value;
      
      // Navigate to payment page with both passenger and flight info
      this.router.navigate(['/payment'], {
        state: {
          passenger: passengerInfo,
          flights: this.selectedFlights
        }
      });
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

  formatPhoneNumber(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 10) input = input.substr(0, 10);
    event.target.value = input;
  }
}