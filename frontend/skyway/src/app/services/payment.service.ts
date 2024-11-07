import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { APP_CONFIG } from '../config/app.config';

export interface BookingRequest {
  flight_id: string;
  passenger: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    date_of_birth: string;
    gender: string;
  };
  payment: {
    card_number: string;
    expiry_date: string;
    name_on_card: string;
  };
}

export interface BookingResponse {
  booking_reference: string;
  message: string;
  flight: {
    id: string;
    origin: string;
    destination: string;
    departure_time: string;
    arrival_time: string;
  };
  passenger: {
    id: string;
    name: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = APP_CONFIG.apiUrl;

  constructor(private http: HttpClient) {}

  createBooking(bookingData: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.apiUrl}/bookings`, bookingData);
  }

  createRoundTripBooking(
    outboundBooking: BookingRequest, 
    returnBooking: BookingRequest
  ): Observable<[BookingResponse, BookingResponse]> {
    return this.createBooking(outboundBooking).pipe(
      switchMap((outboundResponse: BookingResponse) => 
        this.createBooking(returnBooking).pipe(
          map((returnResponse: BookingResponse): [BookingResponse, BookingResponse] => 
            [outboundResponse, returnResponse]
          )
        )
      )
    );
  }
}