import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { TripDetails } from '../my-trips.component';

@Component({
  selector: 'app-trip-card',
  templateUrl: './trip-card.component.html',
  styleUrls: ['./trip-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule
  ]
})
export class TripCardComponent {
  @Input() trip!: TripDetails;
  @Input() expanded = false;
  @Input() isUpcoming = false;

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusColor(): 'primary' | 'warn' | undefined {
    switch (this.trip.status.toLowerCase()) {
      case 'confirmed': return 'primary';
      case 'cancelled': return 'warn';
      default: return undefined;
    }
  }
}