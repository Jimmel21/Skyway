import { Injectable } from '@angular/core';
import html2pdf from 'html2pdf.js';

export interface BookingDetails {
  reference: string;
  flight: string;
  date: string;
  passenger: string;
}

interface Html2PdfOptions {
  margin?: number | [number, number, number, number];
  filename?: string;
  image?: { 
    type?: string; 
    quality?: number 
  };
  html2canvas?: { 
    scale?: number;
    [key: string]: any;
  };
  jsPDF?: { 
    unit?: string; 
    format?: string; 
    orientation?: 'portrait' | 'landscape';
    [key: string]: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  async generateETicket(booking: BookingDetails): Promise<void> {
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; color: #DC2626; font-size: 24px; margin-bottom: 20px;">
          SkyWay Airlines
        </div>
        <div style="text-align: center; font-size: 20px; margin-bottom: 30px;">
          Electronic Ticket
        </div>
        <div style="margin-bottom: 20px;">
          <strong>Booking Reference:</strong> ${booking.reference}
        </div>
        <div style="margin-bottom: 20px;">
          <strong>Flight Details</strong><br>
          ${booking.flight}<br>
          ${booking.date}
        </div>
        <div style="margin-bottom: 20px;">
          <strong>Passenger</strong><br>
          ${booking.passenger}
        </div>
        <div style="margin-top: 30px; font-size: 12px;">
          <strong>Important Information:</strong>
          <ul>
            <li>Please arrive at the airport at least 2 hours before departure</li>
            <li>Valid ID/Passport required for check-in</li>
            <li>Baggage allowance: 23kg checked, 7kg carry-on</li>
          </ul>
        </div>
        <div style="margin-top: 30px; text-align: center; font-size: 12px;">
          This is an electronic ticket. Please present this document at check-in.
        </div>
      </div>
    `;

    const options: Html2PdfOptions = {
      margin: 1,
      filename: `SkyWay_ETicket_${booking.reference}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().from(element).set(options).save();
    } catch (error) {
      console.error('Error generating E-Ticket:', error);
    }
  }

  async generateConfirmation(element: HTMLElement): Promise<void> {
    const options: Html2PdfOptions = {
      margin: 1,
      filename: 'booking-confirmation.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().from(element).set(options).save();
    } catch (error) {
      console.error('Error generating confirmation:', error);
    }
  }
}