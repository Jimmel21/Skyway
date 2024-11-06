import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-trip-card',
  templateUrl: './trip-card.component.html',
  styleUrls: ['./trip-card.component.scss'],
  standalone: true,
  imports: [CommonModule, MatChipsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TripCardComponent {
  @Input() trip!: any;
  @Input() expanded = false;
  @Input() isUpcoming = false;

  formatTime(timeString: string): string {
    if (!timeString) return 'Invalid Time';
    // Assuming timeString is in format "09:30 PM"
    try {
      return timeString;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString || 'Invalid Time';
    }
  }

  formatDate(timeString: string): string {
    if (!timeString) return 'Invalid Date';
    try {

      
 
      const [time, period] = timeString.split(' ');
      const [hours, minutes] = time.split(':');
      //todya's date
      const date = new Date();
      let hour = parseInt(hours);
      
      // Convert to 24-hour format if PM
      if (period === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }
      
      date.setHours(hour, parseInt(minutes));

      // Format the date
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }

  getStatusClass(): string {
    return `status-${this.trip.status.toLowerCase()}`;
  }
}