// import { Injectable, inject } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { APP_CONFIG } from '../config/app.config';

// export interface Airport {
//   id: number;
//   code: string;
//   city: string;
//   country: string;
//   display_name: string;
//   is_active: boolean;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class AirportService {
//   private http = inject(HttpClient);
//   private apiUrl = APP_CONFIG.apiUrl;

//   getAirports(): Observable<Airport[]> {
//     return this.http.get<Airport[]>(`${this.apiUrl}/airports`);
//   }

//   searchFlights(searchData: any): Observable<any> {
//     return this.http.post(`${this.apiUrl}/flights/search`, searchData);
//   }
// }

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

@Injectable({
  providedIn: 'root'  // This ensures the service is provided at the root level
})
export class AirportService {
  private http = inject(HttpClient);
  private apiUrl = APP_CONFIG.apiUrl;

  getAirports(): Observable<Airport[]> {
    return this.http.get<Airport[]>(`${this.apiUrl}/airports`);
  }

  searchFlights(searchData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/flights/search`, searchData);
  }
}