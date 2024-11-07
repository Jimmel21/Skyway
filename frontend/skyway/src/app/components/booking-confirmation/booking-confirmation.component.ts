import { Component, Input, ViewChild, ElementRef, PLATFORM_ID, inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { PdfService } from '../../services/pdf.service';

interface FlightBooking {
  reference: string;
  flight: {
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
  };
  passenger: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-confirmation.component.html',
  styleUrls: ['./booking-confirmation.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class BookingConfirmationComponent implements OnInit {
  bookingDetails: FlightBooking | null = null;
  private platformId = inject(PLATFORM_ID);
  isLoading = false;

  constructor(
    private router: Router,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { 
      bookingData: FlightBooking 
    };

    if (state?.bookingData) {
      this.bookingDetails = state.bookingData;
    } else {
      // If no booking data, redirect to home
      this.router.navigate(['/']);
    }
  }

  getFormattedFlightRoute(): string {
    if (!this.bookingDetails?.flight) return '';
    return `${this.bookingDetails.flight.origin} to ${this.bookingDetails.flight.destination}`;
  }

  getFormattedDate(): string {
    if (!this.bookingDetails?.flight?.departureTime) return '';
    return new Date(this.bookingDetails.flight.departureTime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getPassengerName(): string {
    if (!this.bookingDetails?.passenger) return '';
    return `${this.bookingDetails.passenger.firstName} ${this.bookingDetails.passenger.lastName}`;
  }

  async downloadETicket(): Promise<void> {
    if (!this.bookingDetails) return;

    this.isLoading = true;
    try {
      await this.pdfService.generateETicket({
        reference: this.bookingDetails.reference,
        flight: this.getFormattedFlightRoute(),
        date: this.getFormattedDate(),
        passenger: this.getPassengerName()
      });
    } catch (error) {
      console.error('Error downloading E-Ticket:', error);
    } finally {
      this.isLoading = false;
    }
  }

  printConfirmation(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.print();
    }
  }
}