import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface CardType {
  name: string;
  pattern: RegExp;
  icon: string;
}

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  animations: [
    trigger('loadingState', [
      state('loading', style({
        opacity: 0.7,
        pointerEvents: 'none'
      })),
      state('not-loading', style({
        opacity: 1,
        pointerEvents: 'all'
      })),
      transition('loading <=> not-loading', animate('200ms ease-in-out'))
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ]
})
export class PaymentSummaryComponent implements OnInit {
  paymentForm!: FormGroup;
  isProcessing = false;
  detectedCardType: string = '';
  isCardFlipped = false;
  isCvvFocused = false;

  readonly cardTypes: CardType[] = [
    {
      name: 'visa',
      pattern: /^4/,
      icon: 'visa-icon'
    },
    {
      name: 'mastercard',
      pattern: /^5[1-5]/,
      icon: 'mastercard-icon'
    },
    {
      name: 'amex',
      pattern: /^3[47]/,
      icon: 'amex-icon'
    },
    {
      name: 'discover',
      pattern: /^6(?:011|5)/,
      icon: 'discover-icon'
    }
  ];

  flightDetails = {
    from: 'New York (JFK)',
    to: 'London (LHR)',
    date: 'June 15, 2023',
    passengers: '1 Adult'
  };

  priceSummary = {
    baseFare: 400,
    taxesAndFees: 50,
    total: 450
  };

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormListeners();
  }

  private initializeForm(): void {
    this.paymentForm = this.fb.group({
      cardNumber: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{16}$')
      ]],
      expiryDate: ['', [
        Validators.required,
        Validators.pattern('^(0[1-9]|1[0-2])\/?([0-9]{2})$')
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

  private setupFormListeners(): void {
    // Listen for card number changes
    this.paymentForm.get('cardNumber')?.valueChanges.subscribe(value => {
      this.detectCardType(value);
    });
  }

  detectCardType(number: string): void {
    if (!number) {
      this.detectedCardType = '';
      return;
    }

    const matchedCard = this.cardTypes.find(card => card.pattern.test(number));
    this.detectedCardType = matchedCard ? matchedCard.name : '';
  }

  formatCardNumber(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 16) input = input.substr(0, 16);
    
    // Format with spaces
    let formatted = '';
    for (let i = 0; i < input.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += input[i];
    }
    
    event.target.value = formatted;
    this.paymentForm.patchValue({ cardNumber: input }, { emitEvent: false });
  }

  formatExpiryDate(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 4) input = input.substr(0, 4);
    if (input.length > 2) {
      input = input.substr(0, 2) + '/' + input.substr(2);
    }
    event.target.value = input;
    this.paymentForm.patchValue({ expiryDate: input }, { emitEvent: false });
  }

  onCvvFocus(): void {
    this.isCardFlipped = true;
    this.isCvvFocused = true;
  }

  onCvvBlur(): void {
    this.isCardFlipped = false;
    this.isCvvFocused = false;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.paymentForm.get(fieldName);
    
    if (!control?.errors || !control.touched) {
      return '';
    }

    switch (fieldName) {
      case 'cardNumber':
        if (control.errors['required']) return 'Card number is required';
        if (control.errors['pattern']) return 'Please enter a valid 16-digit card number';
        break;
      case 'expiryDate':
        if (control.errors['required']) return 'Expiry date is required';
        if (control.errors['pattern']) return 'Please enter a valid expiry date (MM/YY)';
        break;
      case 'cvv':
        if (control.errors['required']) return 'CVV is required';
        if (control.errors['pattern']) return 'Please enter a valid CVV';
        break;
      case 'nameOnCard':
        if (control.errors['required']) return 'Name is required';
        if (control.errors['minlength']) return 'Name must be at least 3 characters';
        break;
    }
    return 'Invalid input';
  }

  // async onSubmit(): Promise<void> {
  //   if (this.paymentForm.valid) {
  //     this.isProcessing = true;
  //     try {
  //       await new Promise(resolve => setTimeout(resolve, 1500));
  //       console.log('Payment processed:', this.paymentForm.value);
  //       this.router.navigate(['/booking-confirmation']);
  //     } catch (error) {
  //       console.error('Payment failed:', error);
  //     } finally {
  //       this.isProcessing = false;
  //     }
  //   } else {
  //     Object.keys(this.paymentForm.controls).forEach(key => {
  //       const control = this.paymentForm.get(key);
  //       if (control?.invalid) {
  //         control.markAsTouched();
  //       }
  //     });
  //   }
  // }

  async onSubmit(): Promise<void> {
    if (this.paymentForm.valid) {
      this.isProcessing = true;
      try {
      
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Payment processed:', this.paymentForm.value);
        
        
        const bookingRef = 'SKY' + Math.random().toString(36).substring(2, 8).toUpperCase();
        
     
        const nameOnCard = this.paymentForm.get('nameOnCard')?.value;
        
   
        this.router.navigate(['/confirmation'], { 
          state: {
            booking: {
              reference: bookingRef,
              flight: `${this.flightDetails.from} to ${this.flightDetails.to}`,
              date: this.flightDetails.date,
              passenger: nameOnCard 
            }
          }
        });
      } catch (error) {
        console.error('Payment failed:', error);
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

  getCardIcon(): string {
    const card = this.cardTypes.find(c => c.name === this.detectedCardType);
    return card ? card.icon : 'generic-card-icon';
  }
}