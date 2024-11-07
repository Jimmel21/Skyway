import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface CardType {
  name: string;
  pattern: RegExp;
  icon: string;
}

interface PaymentPageState {
  passenger: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: string;
  };
  flights: {
    flight: {
      id: string;
      origin: string;
      destination: string;
      departureTime: string;
      arrivalTime: string;
      price: number;
    };
    returnFlight?: {
      id: string;
      origin: string;
      destination: string;
      departureTime: string;
      arrivalTime: string;
      price: number;
    } | null;
    totalPrice: number;
  };
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
  bookingDetails: PaymentPageState | null = null;
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    
    if (isPlatformBrowser(this.platformId)) {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras?.state as PaymentPageState;

      if (state) {
        this.bookingDetails = state;
        console.log('Received booking details:', this.bookingDetails);
      } else {
        // If no state in navigation, check history state
        const historyState = history.state;
        if (historyState && historyState.passenger && historyState.flights) {
          this.bookingDetails = historyState as PaymentPageState;
          console.log('Retrieved from history:', this.bookingDetails);
        } else {
          console.log('No booking details found, redirecting...');
          this.router.navigate(['/']);
        }
      }
    }
  }

  ngOnInit(): void {
    if (!this.bookingDetails && isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/']);
      return;
    }
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

  async onSubmit(): Promise<void> {
    if (this.paymentForm.valid && this.bookingDetails) {
      this.isProcessing = true;
      
      try {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Navigate to confirmation page with booking details
        this.router.navigate(['/confirmation'], {
          state: {
            bookingData: {
              reference: 'SKY' + Math.random().toString(36).substr(2, 6).toUpperCase(),
              flight: this.bookingDetails.flights.flight,
              passenger: this.bookingDetails.passenger
            }
          }
        });
      } catch (error) {
        console.error('Payment processing error:', error);
        // Handle payment error
      } finally {
        this.isProcessing = false;
      }
    }
  }

  getCardIcon(): string {
    const card = this.cardTypes.find(c => c.name === this.detectedCardType);
    return card ? card.icon : 'generic-card-icon';
  }
}