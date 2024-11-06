import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

// Updated to include both outbound and return flights
export interface FlightSearchResponse {
  outboundFlights: Flight[];
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

  // Updated to return FlightSearchResponse instead of Flight[]
  searchFlights(searchData: FlightSearchRequest): Observable<FlightSearchResponse> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http.post<FlightSearchResponse>(
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