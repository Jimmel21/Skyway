import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TripCardComponent } from './trip-card/trip-card.component';
import { AirportService } from '../../services/airport.service';

export interface TripDetails {
  reference: string;
  flight: {
    departure_city: string;
    arrival_city: string;
    departure_time: string;
    arrival_time: string;
  };
  passenger: {
    name: string;
    email: string;
  };
  status: string;
}

@Component({
  selector: 'app-my-trips',
  templateUrl: './my-trips.component.html',
  styleUrls: ['./my-trips.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TripCardComponent
  ]
})
export class MyTripsComponent {
  searchForm!: FormGroup;
  trips: TripDetails[] = [];
  isLoading = false;
  error: string | null = null;
  selectedTrip: TripDetails | null = null;
  searchMode: 'reference' | 'email' = 'reference';

  constructor(
    private fb: FormBuilder,
    private airportService: AirportService
  ) {
    this.searchForm = this.fb.group({
      bookingReference: ['', [Validators.pattern(/^SKY[A-Z0-9]{6}$/)]],
      email: ['', [Validators.email]],
      lastName: ['', [Validators.pattern(/^[a-zA-Z\s-']+$/)]]
    });
  }

  switchMode(mode: 'reference' | 'email'): void {
    this.searchMode = mode;
    this.searchForm.reset();
  }

  isFormValid(): boolean {
    if (this.searchMode === 'reference') {
      return this.searchForm.get('bookingReference')?.valid || false;
    } else {
      return (
        this.searchForm.get('email')?.valid &&
        this.searchForm.get('lastName')?.valid
      ) || false;
    }
  }

  searchTrips(): void {
    if (this.isFormValid()) {
      this.isLoading = true;
      this.error = null;
      
      const searchData = this.searchMode === 'reference'
        ? { booking_reference: this.searchForm.get('bookingReference')?.value }
        : {
            email: this.searchForm.get('email')?.value,
            last_name: this.searchForm.get('lastName')?.value
          };

      this.airportService.searchBookings(searchData).subscribe({
        next: (response) => {
          this.trips = this.sortTrips(response);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Search error:', error);
          this.error = error.error?.message || 'Unable to find matching trips';
          this.isLoading = false;
          this.trips = [];
        }
      });
    }
  }

  private sortTrips(trips: TripDetails[]): TripDetails[] {
    return trips.sort((a, b) => 
      new Date(b.flight.departure_time).getTime() - 
      new Date(a.flight.departure_time).getTime()
    );
  }

  getCurrentTrips(): TripDetails[] {
    const now = new Date();
    return this.trips.filter(trip => 
      new Date(trip.flight.departure_time) >= now
    );
  }

  getPastTrips(): TripDetails[] {
    const now = new Date();
    return this.trips.filter(trip => 
      new Date(trip.flight.departure_time) < now
    );
  }

  toggleTripDetails(trip: TripDetails): void {
    this.selectedTrip = this.selectedTrip?.reference === trip.reference ? null : trip;
  }
}