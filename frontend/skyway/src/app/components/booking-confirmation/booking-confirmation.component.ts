import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { PdfService } from '../../services/pdf.service';

interface FlightDetails {
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
}

interface PassengerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
}

interface BookingData {
  reference: string;
  flight: FlightDetails;
  returnFlight?: FlightDetails | null;
  passenger: PassengerDetails;
  totalPrice: number;
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
  bookingDetails: BookingData | null = null;
  isLoading = false;
  isDownloading = false;

  constructor(
    private router: Router,
    private pdfService: PdfService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      console.log('Received state:', navigation.extras.state);
      this.bookingDetails = navigation.extras.state['bookingData'];
    } else if (isPlatformBrowser(this.platformId)) {
      const state = window?.history?.state;
      if (state?.bookingData) {
        this.bookingDetails = state.bookingData;
        console.log('Retrieved from browser history:', this.bookingDetails);
      }
    }
  }

  ngOnInit(): void {
    console.log('Component initialized with booking details:', this.bookingDetails);
  }
  
  getFormattedFlightRoute(flight: FlightDetails | null | undefined): string {
    if (!flight) return '';
    return `${flight.origin} to ${flight.destination}`;
  }


  getFormattedDate(flight: FlightDetails | null | undefined): string {
    if (!flight?.departureTime) {
      return '';
    }
    
    try {
      const date = new Date(flight.departureTime);
      if (isNaN(date.getTime())) {
        return '';
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  getFormattedTime(time: string | null | undefined): string {
    if (!time) {
      return '';
    }
    
    try {
      const date = new Date(time);
      if (isNaN(date.getTime())) {
        return '';
      }
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  }

  getPassengerName(): string {
    const firstName = this.bookingDetails?.passenger?.firstName || '';
    const lastName = this.bookingDetails?.passenger?.lastName || '';
    return `${firstName} ${lastName}`.trim();
  }

  getFormattedPrice(price: number | null | undefined): string {
    if (typeof price !== 'number') {
      return '$0.00';
    }
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price);
    } catch (error) {
      console.error('Error formatting price:', error);
      return '$0.00';
    }
  }

  async downloadETicket(): Promise<void> {
    if (!this.bookingDetails) return;

    this.isDownloading = true;
    try {
      const ticketData = {
        reference: this.bookingDetails.reference,
        flight: this.getFormattedFlightRoute(this.bookingDetails.flight),
        date: this.getFormattedDate(this.bookingDetails.flight),
        passenger: this.getPassengerName()
      };

      if (this.bookingDetails.returnFlight) {
        ticketData.flight += `\nReturn: ${this.getFormattedFlightRoute(this.bookingDetails.returnFlight)}`;
        ticketData.date += `\nReturn: ${this.getFormattedDate(this.bookingDetails.returnFlight)}`;
      }

      await this.pdfService.generateETicket(ticketData);
    } catch (error) {
      console.error('Error downloading E-Ticket:', error);
    } finally {
      this.isDownloading = false;
    }
  }


  printConfirmation(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.print();
    }
  }
}