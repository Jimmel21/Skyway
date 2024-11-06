import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { PdfService, BookingDetails } from '../../services/pdf.service';

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

  @ViewChild('confirmationContent') confirmationContent!: ElementRef<HTMLElement>;

  constructor(private pdfService: PdfService) {}

  async downloadETicket(): Promise<void> {
    try {
      await this.pdfService.generateETicket(this.booking);
    } catch (error) {
      console.error('Error downloading E-Ticket:', error);
      
    }
  }

  async printConfirmation(): Promise<void> {
    if (this.confirmationContent) {
      try {
        await this.pdfService.generateConfirmation(this.confirmationContent.nativeElement);
      } catch (error) {
        console.error('Error printing confirmation:', error);
        
      }
    }
  }
}