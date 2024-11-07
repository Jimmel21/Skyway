import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { PaymentService, BookingRequest, BookingResponse } from '../../services/payment.service';
import { catchError, finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
        opacity: 0.7
      })),
      state('not-loading', style({
        opacity: 1
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
  errorMessage: string = '';

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
    private paymentService: PaymentService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras?.state as PaymentPageState;

      if (state) {
        this.bookingDetails = state;
        console.log('Received booking details:', this.bookingDetails);
      } else {
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

  private createPaymentRequest(flightId: string): BookingRequest {
    if (!this.bookingDetails || !this.paymentForm.valid) {
      throw new Error('Invalid form or booking details');
    }

    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    };

    return {
      flight_id: flightId,
      passenger: {
        first_name: this.bookingDetails.passenger.firstName,
        last_name: this.bookingDetails.passenger.lastName,
        email: this.bookingDetails.passenger.email,
        phone_number: this.bookingDetails.passenger.phoneNumber,
        date_of_birth: formatDate(this.bookingDetails.passenger.dateOfBirth),
        gender: this.bookingDetails.passenger.gender
      },
      payment: {
        card_number: this.paymentForm.get('cardNumber')?.value,
        expiry_date: this.paymentForm.get('expiryDate')?.value,
        name_on_card: this.paymentForm.get('nameOnCard')?.value
      }
    };
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
      this.errorMessage = '';
      
      try {
        if (this.bookingDetails.flights.returnFlight) {
          
          const outboundPayment = this.createPaymentRequest(this.bookingDetails.flights.flight.id);
          const returnPayment = this.createPaymentRequest(this.bookingDetails.flights.returnFlight.id);

          this.paymentService.createRoundTripBooking(outboundPayment, returnPayment)
            .pipe(
              catchError(error => {
                console.error('Booking creation error:', error);
                this.errorMessage = error.error?.error || 'Failed to create booking. Please try again.';
                throw error;
              }),
              finalize(() => this.isProcessing = false)
            )
            .subscribe({
              next: ([outboundResponse, returnResponse]) => {
                this.navigateToConfirmation(outboundResponse.booking_reference, {
                  outbound: outboundResponse,
                  return: returnResponse
                });
              },
              error: (error) => {
                console.error('Booking creation error:', error);
                this.errorMessage = error.error?.error || 'Failed to create booking. Please try again.';
                this.isProcessing = false;
              }
            });
        } else {
          
          const paymentRequest = this.createPaymentRequest(this.bookingDetails.flights.flight.id);

          this.paymentService.createBooking(paymentRequest)
            .pipe(
              catchError(error => {
                console.error('Booking creation error:', error);
                this.errorMessage = error.error?.error || 'Failed to create booking. Please try again.';
                throw error;
              }),
              finalize(() => this.isProcessing = false)
            )
            .subscribe({
              next: (response) => {
                this.navigateToConfirmation(response.booking_reference, {
                  outbound: response
                });
              },
              error: (error) => {
                console.error('Booking creation error:', error);
                this.errorMessage = error.error?.error || 'Failed to create booking. Please try again.';
                this.isProcessing = false;
              }
            });
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        this.isProcessing = false;
        this.errorMessage = 'An unexpected error occurred. Please try again.';
      }
    } else {
      Object.keys(this.paymentForm.controls).forEach(key => {
        const control = this.paymentForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  private navigateToConfirmation(bookingReference: string, bookingResponses: {
    outbound: BookingResponse;
    return?: BookingResponse;
  }): void {
    this.router.navigate(['/confirmation'], {
      state: {
        bookingData: {
          reference: bookingReference,
          flight: this.bookingDetails?.flights.flight,
          returnFlight: this.bookingDetails?.flights.returnFlight,
          passenger: this.bookingDetails?.passenger,
          bookingResponses
        }
      }
    });
  }

  getCardIcon(): string {
    const card = this.cardTypes.find(c => c.name === this.detectedCardType);
    return card ? card.icon : 'generic-card-icon';
  }
}