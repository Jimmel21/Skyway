import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

interface BookingDetails {
  reference: string;
  flight: string;
  date: string;
  passenger: string;
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
export class BookingConfirmationComponent {
  @Input() booking: BookingDetails = {
    reference: 'SKY123456',
    flight: 'New York (JFK) to London (LHR)',
    date: 'June 15, 2023',
    passenger: 'John Doe'
  };

  downloadETicket() {
    console.log('Downloading E-Ticket...');
  }

  printConfirmation() {
    console.log('Printing confirmation...');
  }
}