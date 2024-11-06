import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

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
  private document = inject(DOCUMENT);

  async generateETicket(booking: BookingDetails): Promise<void> {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = this.document.createElement('div');
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
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait' as 'portrait' | 'landscape'
        }
      };

      await html2pdf().from(element).set(options).save();
    } catch (error) {
      console.error('Error generating E-Ticket:', error);
      throw error;
    }
  }

  // async printConfirmation(element: HTMLElement): Promise<void> {
  //   // Create a hidden iframe for printing
  //   const printFrame = this.document.createElement('iframe');
  //   printFrame.style.position = 'fixed';
  //   printFrame.style.right = '0';
  //   printFrame.style.bottom = '0';
  //   printFrame.style.width = '0';
  //   printFrame.style.height = '0';
  //   printFrame.style.border = '0';
    
  //   this.document.body.appendChild(printFrame);

  //   const printDocument = printFrame.contentDocument || printFrame.contentWindow?.document;
  //   if (!printDocument) {
  //     throw new Error('Could not create print document');
  //   }

  //   // Get all stylesheets from the main document
  //   const styleSheets = Array.from(this.document.styleSheets);
  //   const stylePromises = styleSheets.map(async (sheet) => {
  //     try {
  //       if (sheet.href) {
  //         const response = await fetch(sheet.href);
  //         return await response.text();
  //       } else if (sheet.cssRules) {
  //         return Array.from(sheet.cssRules)
  //           .map(rule => rule.cssText)
  //           .join('\n');
  //       }
  //       return '';
  //     } catch {
  //       return '';
  //     }
  //   });

  //   // Wait for all styles to be collected
  //   const styles = await Promise.all(stylePromises);

  //   // Write the content to the iframe
  //   printDocument.write(`
  //     <!DOCTYPE html>
  //     <html>
  //       <head>
  //         <title>Booking Confirmation - ${element.querySelector('.value')?.textContent || 'SkyWay Airlines'}</title>
  //         <style>
  //           ${styles.join('\n')}
  //           @media print {
  //             body {
  //               padding: 20px;
  //               margin: 0;
  //               color: #000;
  //             }
  //             .action-buttons {
  //               display: none !important;
  //             }
  //             .confirmation-container {
  //               box-shadow: none !important;
  //               border: none !important;
  //             }
  //             @page {
  //               margin: 0.5cm;
  //             }
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         ${element.outerHTML}
  //       </body>
  //     </html>
  //   `);
  //   printDocument.close();

  //   // Wait for images and styles to load
  //   await new Promise<void>((resolve) => {
  //     if (printFrame.contentWindow) {
  //       printFrame.contentWindow.onload = () => {
  //         resolve();
  //       };
  //     } else {
  //       resolve();
  //     }
  //   });

  //   // Print and cleanup
  //   try {
  //     if (printFrame.contentWindow) {
  //       printFrame.contentWindow.print();
  //     }
  //   } finally {
  //     // Remove the iframe after a delay to ensure print dialog has been shown
  //     setTimeout(() => {
  //       printFrame.remove();
  //     }, 1000);
  //   }
  // }
  printConfirmation(): void {
    window.print();
  }
}