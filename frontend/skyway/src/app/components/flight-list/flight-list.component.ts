import { Component, OnInit } from '@angular/core';

interface Flight {
  departureTime: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  duration: string;
  price: number;
}

interface FlightSearch {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
}

@Component({
  selector: 'app-flight-results',
  templateUrl: './flight-list.component.html',
  styleUrls: ['./flight-list.component.scss']
})
export class FlightResultsComponent implements OnInit {
  flights: Flight[] = [
    {
      departureTime: '08:00 AM',
      arrivalTime: '8:00 PM',
      origin: 'New York (JFK)',
      destination: 'London (LHR)',
      duration: '7h 00m',
      price: 450
    },
    {
      departureTime: '12:00 PM',
      arrivalTime: '12:00 AM',
      origin: 'New York (JFK)',
      destination: 'London (LHR)',
      duration: '7h 00m',
      price: 500
    },
    {
      departureTime: '04:00 PM',
      arrivalTime: '4:00 AM',
      origin: 'New York (JFK)',
      destination: 'London (LHR)',
      duration: '7h 00m',
      price: 475
    }
  ];

  searchDetails: FlightSearch = {
    origin: 'New York (JFK)',
    destination: 'London (LHR)',
    date: 'June 15, 2023',
    passengers: 1
  };

  selectedSort: 'cheapest' | 'fastest' | 'best' = 'cheapest';

  constructor() { }

  ngOnInit(): void {
    this.sortFlights(this.selectedSort);
  }

  sortFlights(criteria: 'cheapest' | 'fastest' | 'best'): void {
    this.selectedSort = criteria;
    
    switch (criteria) {
      case 'cheapest':
        this.flights.sort((a, b) => a.price - b.price);
        break;
      case 'fastest':
        this.flights.sort((a, b) => 
          this.getDurationInMinutes(a.duration) - this.getDurationInMinutes(b.duration)
        );
        break;
      case 'best':
        // Implement your own best value algorithm here
        this.flights.sort((a, b) => 
          (a.price / this.getDurationInMinutes(a.duration)) -
          (b.price / this.getDurationInMinutes(b.duration))
        );
        break;
    }
  }

  private getDurationInMinutes(duration: string): number {
    const [hours, minutes] = duration.split('h ').map(part => 
      parseInt(part.replace('m', ''))
    );
    return (hours * 60) + (minutes || 0);
  }

  selectFlight(flight: Flight): void {
    // Implement flight selection logic here
    console.log('Selected flight:', flight);
  }

  loadMore(): void {
    // Implement load more logic here
    console.log('Loading more results...');
  }

  changeSearch(): void {
    // Implement change search logic here
    console.log('Changing search criteria...');
  }
}