import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { TripDetails } from '../../../types/trip.types';

@Component({
  selector: 'app-trip-card',
  templateUrl: './trip-card.component.html',
  styleUrls: ['./trip-card.component.scss'],
  standalone: true,
  imports: [CommonModule, MatChipsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
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
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  getStatusColor(): 'primary' | 'warn' | 'default' {
    switch (this.trip.status.toLowerCase()) {
      case 'confirmed':
        return 'primary';
      case 'cancelled':
        return 'warn';
      default:
        return 'default';
    }
  }

  getStatusClass(): string {
    return `status-${this.trip.status.toLowerCase()}`;
  }

  isCheckInAvailable(): boolean {
    if (this.trip.status !== 'CONFIRMED') return false;
    
    const departureTime = new Date(this.trip.flight.departure_time);
    const now = new Date();
    const hoursDifference = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursDifference <= 48 && hoursDifference > 1;
  }

  getDepartureDate(): Date {
    return new Date(this.trip.flight.departure_time);
  }

  getArrivalDate(): Date {
    return new Date(this.trip.flight.arrival_time);
  }

  getTripDuration(): string {
    const departure = this.getDepartureDate();
    const arrival = this.getArrivalDate();
    const durationMs = arrival.getTime() - departure.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }
}