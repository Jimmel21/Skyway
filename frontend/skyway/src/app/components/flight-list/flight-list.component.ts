import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Flight } from '../../services/airport.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface SearchDetails {
  originName: string;
  destinationName: string;
  origin_id: number;
  destination_id: number;
  date: string;
  return_date?: string | null;
  passengers: number;
  tripType: 'roundtrip' | 'oneway' | 'recent';
}
@Component({
  selector: 'app-flight-results',
  templateUrl: './flight-list.component.html',
  styleUrls: ['./flight-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ]
})
export class FlightResultsComponent implements OnInit {
  flights: Flight[] = [];
  returnFlights: Flight[] = [];
  searchDetails: SearchDetails | null = null;
  selectedSort: 'cheapest' | 'fastest' | 'best' = 'cheapest';
  noFlightsFound = false;
  loading = true;
  error: string | null = null;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      searchResults: Flight[];
      returnFlights?: Flight[];
      searchCriteria: SearchDetails;
      error?: string;
    };

    console.log('Full Navigation State:', state);
    console.log('Search Results from state:', state?.searchResults);
    console.log('Return Flights from state:', state?.returnFlights);
    console.log('Search Details:', state?.searchCriteria);

    if (state) {
      this.flights = state.searchResults;
      this.returnFlights = state.returnFlights || [];
      this.searchDetails = state.searchCriteria;
      console.log('Search Details:', this.searchDetails);
      this.error = state.error || null;
      this.noFlightsFound = this.flights.length === 0;
    }
    
    this.loading = false;
  }

  ngOnInit(): void {
    if (!this.searchDetails) {
      this.router.navigate(['/']); // Redirect to search if no search criteria
      return;
    }
    this.sortFlights(this.selectedSort);
  }

  loadMoreResults() {
    console.log('Loading more results...just for demo. Does not work sry.');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(timestring: string): string {
    return timestring

  }

  sortFlights(criteria: 'cheapest' | 'fastest' | 'best'): void {
    this.selectedSort = criteria;
    
    const sortFunction = (flightArray: Flight[]) => {
      switch (criteria) {
        case 'cheapest':
          return flightArray.sort((a, b) => a.price - b.price);
        case 'fastest':
          return flightArray.sort((a, b) => 
            this.getDurationInMinutes(a.duration) - this.getDurationInMinutes(b.duration)
          );
        case 'best':
          return flightArray.sort((a, b) => 
            (a.price / this.getDurationInMinutes(a.duration)) -
            (b.price / this.getDurationInMinutes(b.duration))
          );
      }
    };

    this.flights = sortFunction([...this.flights]);
    if (this.returnFlights.length > 0) {
      this.returnFlights = sortFunction([...this.returnFlights]);
    }
  }

  private getDurationInMinutes(duration: string): number {
    const [hours, minutes] = duration.split('h ').map(part => 
      parseInt(part.replace('m', ''))
    );
    return (hours * 60) + (minutes || 0);
  }

  formatDuration(duration: string): string {
    const [hours, minutes] = duration.split('h ');
    return `${hours}h ${minutes || '00m'}`;
  }

  selectFlight(flight: Flight, isReturn: boolean = false): void {
    this.router.navigate(['/passenger-info'], {
      state: {
        flight,
        returnFlight: isReturn ? null : this.returnFlights[0],
        searchDetails: this.searchDetails
      }
    });
  }

  getSeatsMessage(availableSeats: number): string {
    if (availableSeats === 0) return 'Sold Out';
    if (availableSeats <= 5) return `Only ${availableSeats} seats left`;
    return `${availableSeats} seats available`;
  }
}