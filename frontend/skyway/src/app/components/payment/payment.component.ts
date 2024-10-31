import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface FlightDetails {
  from: string;
  to: string;
  date: string;
  passengers: string;
}

interface PriceSummary {
  baseFare: number;
  taxesAndFees: number;
  total: number;
}

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class PaymentSummaryComponent implements OnInit {
  paymentForm: FormGroup;
  isProcessing = false;

  flightDetails: FlightDetails = {
    from: 'New York (JFK)',
    to: 'London (LHR)',
    date: 'June 15, 2023',
    passengers: '1 Adult'
  };

  priceSummary: PriceSummary = {
    baseFare: 400,
    taxesAndFees: 50,
    total: 450
  };

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.paymentForm = this.fb.group({
      cardNumber: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{16}$')
      ]],
      expiryDate: ['', [
        Validators.required,
        Validators.pattern('^(0[1-9]|1[0-2])\/([0-9]{2})$')
      ]],
      cvv: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{3,4}$')
      ]],
      nameOnCard: ['', [
        Validators.required,
        Validators.minLength(3)
      ]]
    });
  }

  ngOnInit(): void {}

  getErrorMessage(fieldName: string): string {
    const control = this.paymentForm.get(fieldName);
    
    if (!control?.errors || !control.touched) {
      return '';
    }

    switch (fieldName) {
      case 'cardNumber':
        if (control.errors['required']) {
          return 'Card number is required';
        }
        if (control.errors['pattern']) {
          return 'Please enter a valid 16-digit card number';
        }
        break;

      case 'expiryDate':
        if (control.errors['required']) {
          return 'Expiry date is required';
        }
        if (control.errors['pattern']) {
          return 'Please enter a valid expiry date (MM/YY)';
        }
        break;

      case 'cvv':
        if (control.errors['required']) {
          return 'CVV is required';
        }
        if (control.errors['pattern']) {
          return 'Please enter a valid CVV number';
        }
        break;

      case 'nameOnCard':
        if (control.errors['required']) {
          return 'Name on card is required';
        }
        if (control.errors['minlength']) {
          return 'Name must be at least 3 characters long';
        }
        break;
    }

    return 'Invalid input';
  }

  formatCardNumber(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 16) input = input.substr(0, 16);
    event.target.value = input;
  }

  formatExpiryDate(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 4) input = input.substr(0, 4);
    if (input.length > 2) {
      input = input.substr(0, 2) + '/' + input.substr(2);
    }
    event.target.value = input;
  }

  async onSubmit(): Promise<void> {
    if (this.paymentForm.valid) {
      this.isProcessing = true;
      try {
        // Here you would integrate with your payment processing service
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
        console.log('Payment processed successfully');
        this.router.navigate(['/booking-confirmation']);
      } catch (error) {
        console.error('Payment processing failed:', error);
      } finally {
        this.isProcessing = false;
      }
    } else {
      Object.keys(this.paymentForm.controls).forEach(key => {
        const control = this.paymentForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  hasError(fieldName: string, errorType: string): boolean {
    const control = this.paymentForm.get(fieldName);
    return control?.touched && control?.hasError(errorType) || false;
  }
}