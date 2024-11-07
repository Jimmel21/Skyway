import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Flight } from '../../services/airport.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

type SortOption = 'cheapest' | 'fastest' | 'best';

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
  originalFlights: Flight[] = [];


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
      this.originalFlights = [...state.searchResults];
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
      this.router.navigate(['/']);
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

  // sortFlights(criteria: 'cheapest' | 'fastest' | 'best'): void {
  //   this.selectedSort = criteria;
    
  //   const sortFunction = (flightArray: Flight[]) => {
  //     switch (criteria) {
  //       case 'cheapest':
  //         return flightArray.sort((a, b) => a.price - b.price);
  //       case 'fastest':
  //         return flightArray.sort((a, b) => 
  //           this.getDurationInMinutes(a.duration) - this.getDurationInMinutes(b.duration)
  //         );
  //       case 'best':
  //         return flightArray.sort((a, b) => 
  //           (a.price / this.getDurationInMinutes(a.duration)) -
  //           (b.price / this.getDurationInMinutes(b.duration))
  //         );
  //     }
  //   };

  //   this.flights = sortFunction([...this.flights]);
  //   if (this.returnFlights.length > 0) {
  //     this.returnFlights = sortFunction([...this.returnFlights]);
  //   }
  // }

  // private getDurationInMinutes(duration: string): number {
  //   const [hours, minutes] = duration.split('h ').map(part => 
  //     parseInt(part.replace('m', ''))
  //   );
  //   return (hours * 60) + (minutes || 0);
  // }

  sortFlights(criteria: 'cheapest' | 'fastest' | 'best'): void {
    console.log('Sorting by:', criteria); // Debug log
    this.selectedSort = criteria;
    
    // Always sort from the original list to avoid cumulative sorting issues
    const flightsToSort = [...this.originalFlights];
    
    switch (criteria) {
      case 'cheapest':
        this.flights = flightsToSort.sort((a, b) => a.price - b.price);
        break;
      
      case 'fastest':
        this.flights = flightsToSort.sort((a, b) => {
          const durationA = this.getDurationInMinutes(a.duration);
          const durationB = this.getDurationInMinutes(b.duration);
          return durationA - durationB;
        });
        break;
      
      case 'best':
        this.flights = flightsToSort.sort((a, b) => {
          const valueA = a.price / this.getDurationInMinutes(a.duration);
          const valueB = b.price / this.getDurationInMinutes(b.duration);
          return valueA - valueB;
        });
        break;
    }

    console.log('Sorted flights:', this.flights); // Debug log
  }

  private getDurationInMinutes(duration: string): number {
    // Handle duration in format "7h 00m"
    const [hours, minutes] = duration.split('h ');
    const hoursNum = parseInt(hours) || 0;
    const minutesNum = parseInt(minutes?.replace('m', '')) || 0;
    return (hoursNum * 60) + minutesNum;
  }

  formatDuration(duration: string): string {
    const [hours, minutes] = duration.split('h ');
    return `${hours}h ${minutes || '00m'}`;
  }

  // selectFlight(flight: Flight, isReturn: boolean = false): void {
  //   this.router.navigate(['/passenger-info'], {
  //     state: {
  //       flight,
  //       returnFlight: isReturn ? null : this.returnFlights[0],
  //       searchDetails: this.searchDetails
  //     }
  //   });
  // }

  selectFlight(flight: Flight, isReturn: boolean = false): void {
    const navigationState = {
      flight,
      returnFlight: isReturn ? null : this.returnFlights[0],
      searchDetails: this.searchDetails,
      totalPrice: flight.price + (isReturn ? 0 : (this.returnFlights[0]?.price || 0))
    };
  
    this.router.navigate(['/passenger-info'], {
      state: navigationState
    });
  }

  getSeatsMessage(availableSeats: number): string {
    if (availableSeats === 0) return 'Sold Out';
    if (availableSeats <= 5) return `Only ${availableSeats} seats left`;
    return `${availableSeats} seats available`;
  }
}