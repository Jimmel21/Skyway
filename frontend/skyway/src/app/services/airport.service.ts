import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app.config';


export interface Airport {
    id: number;
    code: string;
    city: string;
    country: string;
    display_name: string;
    is_active: boolean;
  }
  
  export interface FlightSearchRequest {
    origin_id: number;
    destination_id: number;
    date: string;
    return_date?: string | null;
    passengers?: number;
  }
  
  export interface Flight {
    id: string;
    departureTime: string;
    arrivalTime: string;
    origin: string;
    destination: string;
    duration: string;
    price: number;
    availableSeats: number;
  }
  
  export interface FlightSearchResponse {
    flights: Flight[];
    returnFlights?: Flight[];
  }
  
  export interface SearchCriteria extends FlightSearchRequest {
    tripType: 'roundtrip' | 'oneway' | 'recent';
  }

@Injectable({
  providedIn: 'root'
})
export class AirportService {
  private http = inject(HttpClient);
  private apiUrl = APP_CONFIG.apiUrl;

  getAirports(): Observable<Airport[]> {
    return this.http.get<Airport[]>(`${this.apiUrl}/airports`);
  }

//   searchFlights(searchData: FlightSearchRequest): Observable<FlightSearchResponse> {
//     // Transform the search data to match the API expectations
//     const apiSearchData = {
//       departure_city: searchData.departure_city,
//       arrival_city: searchData.arrival_city,
//       date: this.formatDate(searchData.date),
//       passengers: searchData.passengers || 1,
//       return_date: searchData.return_date ? this.formatDate(searchData.return_date) : null
//     };

//     return this.http.post<FlightSearchResponse>(
//       `${this.apiUrl}/flights/search`, 
//       apiSearchData
//     );
//   }
    searchFlights(searchData: FlightSearchRequest): Observable<Flight[]> {
        const headers = new HttpHeaders().set('Content-Type', 'application/json');
        
        return this.http.post<Flight[]>(
        `${this.apiUrl}/flights/search`,
        searchData,
        { headers }
        );
    }

  private formatDate(date: string | Date): string {
    if (typeof date === 'string') {
      return date;
    }
    return date.toISOString().split('T')[0];
  }
}