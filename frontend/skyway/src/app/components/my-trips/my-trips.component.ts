import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TripCardComponent } from './trip-card/trip-card.component';
import { AirportService } from '../../services/airport.service';
import { TripDetails } from '../../types/trip.types';

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
export class MyTripsComponent implements OnInit, OnDestroy {
  searchForm!: FormGroup;
  trips: TripDetails[] = [];
  isLoading = false;
  error: string | null = null;
  selectedTrip: TripDetails | null = null;
  searchMode: 'reference' | 'email' = 'reference';
  private isBrowser: boolean;

  constructor(
    private fb: FormBuilder,
    private airportService: AirportService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.initializeForm();
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      sessionStorage.removeItem('lastTripSearch');
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      sessionStorage.removeItem('lastTripSearch');
    }
  }

  private initializeForm(): void {
    this.searchForm = this.fb.group({
      bookingReference: ['', [
        Validators.pattern(/^SKY[A-Z0-9]{6}$/)
      ]],
      email: ['', [
        Validators.email
      ]],
      lastName: ['', [
        Validators.pattern(/^[a-zA-Z\s-']+$/),
        Validators.minLength(2)
      ]]
    });

    this.setValidatorsForCurrentMode();
  }

  private setValidatorsForCurrentMode(): void {
    // Clear validators for all fields
    Object.keys(this.searchForm.controls).forEach(key => {
      this.searchForm.get(key)?.clearValidators();
      this.searchForm.get(key)?.updateValueAndValidity();
    });

    // Set validators based on current mode
    if (this.searchMode === 'reference') {
      this.searchForm.get('bookingReference')?.setValidators([
        Validators.required,
        Validators.pattern(/^SKY[A-Z0-9]{6}$/)
      ]);
    } else {
      this.searchForm.get('email')?.setValidators([
        Validators.required,
        Validators.email
      ]);
      this.searchForm.get('lastName')?.setValidators([
        Validators.required,
        Validators.pattern(/^[a-zA-Z\s-']+$/),
        Validators.minLength(2)
      ]);
    }

    // Update validity
    Object.keys(this.searchForm.controls).forEach(key => {
      this.searchForm.get(key)?.updateValueAndValidity();
    });
  }

  switchMode(mode: 'reference' | 'email'): void {
    this.searchMode = mode;
    this.clearSearch();
  }

  clearSearch(): void {
    this.searchForm.reset();
    this.trips = [];
    this.error = null;
    this.selectedTrip = null;
    
    if (this.isBrowser) {
      sessionStorage.removeItem('lastTripSearch');
    }
    
    this.setValidatorsForCurrentMode();
  }

  isFormValid(): boolean {
    if (this.searchMode === 'reference') {
      return this.searchForm.get('bookingReference')?.valid ?? false;
    }
    return (
      this.searchForm.get('email')?.valid &&
      this.searchForm.get('lastName')?.valid
    ) ?? false;
  }

  async searchTrips(silent = false): Promise<void> {
    if (!this.isFormValid()) {
      return;
    }

    if (!silent) {
      this.isLoading = true;
      this.error = null;
    }
    
    const searchData = this.searchMode === 'reference'
      ? { booking_reference: this.searchForm.get('bookingReference')?.value }
      : {
          email: this.searchForm.get('email')?.value,
          last_name: this.searchForm.get('lastName')?.value
        };

    try {
      const response = await this.airportService.searchBookings(searchData).toPromise();
      if (response) {
        this.trips = this.sortTrips(response);
        
        if (this.trips.length === 0) {
          this.error = 'No trips found matching your search criteria.';
        }
      }
    } catch (error: any) {
      console.error('Search error:', error);
      this.error = error.error?.message || 'Unable to find matching trips';
      this.trips = [];
    } finally {
      this.isLoading = false;
    }
  }

  private sortTrips(trips: TripDetails[]): TripDetails[] {
    return trips.sort((a, b) => {
      const dateA = new Date(a.flight.departure_time);
      const dateB = new Date(b.flight.departure_time);
      return dateB.getTime() - dateA.getTime();
    });
  }

  getCurrentTrips(): TripDetails[] {
    const now = new Date();
    return this.trips.filter(trip => {
      const departureDate = new Date(trip.flight.departure_time);
      return departureDate >= now;
    });
  }

  getPastTrips(): TripDetails[] {
    const now = new Date();
    return this.trips.filter(trip => {
      const departureDate = new Date(trip.flight.departure_time);
      return departureDate < now;
    });
  }

  toggleTripDetails(trip: TripDetails): void {
    this.selectedTrip = this.selectedTrip?.reference === trip.reference ? null : trip;
  }

  needsAttention(trip: TripDetails): boolean {
    if (trip.status !== 'CONFIRMED') return false;
    
    const departuretime = new Date(trip.flight.departure_time);
    const now = new Date();
    const hoursDifference = (departuretime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursDifference <= 48 && hoursDifference > 1;
  }
}