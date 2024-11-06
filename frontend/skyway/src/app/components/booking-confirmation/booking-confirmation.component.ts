import { Component, Input, ViewChild, ElementRef, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  private platformId = inject(PLATFORM_ID);
  isLoading = false;

  @Input() booking: BookingDetails = {
    reference: 'SKY123456',
    flight: 'New York (JFK) to London (LHR)',
    date: 'June 15, 2023',
    passenger: 'John Doe'
  };

  @ViewChild('confirmationContent') confirmationContent!: ElementRef<HTMLElement>;

  constructor(private pdfService: PdfService) {}

  async downloadETicket(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isLoading = true;
    try {
      await this.pdfService.generateETicket(this.booking);
    } catch (error) {
      console.error('Error downloading E-Ticket:', error);
    
    } finally {
      this.isLoading = false;
    }
  }

  // async printConfirmation(): Promise<void> {
  //   if (!isPlatformBrowser(this.platformId)) {
  //     return;
  //   }

  //   if (this.confirmationContent) {
  //     this.isLoading = true;
  //     try {
  //       await this.pdfService.printConfirmation(this.confirmationContent.nativeElement);
  //     } catch (error) {
  //       console.error('Error printing confirmation:', error);
      
  //     } finally {
  //       this.isLoading = false;
  //     }
  //   }
  // }
  printConfirmation(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    this.pdfService.printConfirmation();
  }
}