import { Component, OnInit } from '@angular/core';

interface BookingDetails {
  reference: string;
  flight: string;
  date: string;
  passenger: string;
}

@Component({
  selector: 'app-booking-confirmation',
  templateUrl: './booking-confirmation.component.html',
  styleUrls: ['./booking-confirmation.component.scss']
})
export class BookingConfirmationComponent implements OnInit {
  bookingDetails: BookingDetails = {
    reference: 'SKY123456',
    flight: 'New York (JFK) to London (LHR)',
    date: 'June 15, 2023',
    passenger: 'John Doe'
  };

  constructor() { }

  ngOnInit(): void {
    // Any initialization logic can go here
  }

  downloadETicket(): void {
    // Implement e-ticket download logic
    console.log('Downloading E-Ticket...');
  }

  printConfirmation(): void {
    // Implement print logic
    window.print();
  }
}