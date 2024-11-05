export interface AirportType {
    id: number;
    code: string;
    city: string;
    country: string;
    display_name: string;
    is_active: boolean;
  }
  
  export interface FlightSearchRequest {
    departure_city: string;
    arrival_city: string;
    date: string;
    passengers?: number;
    return_date?: string | null;
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
  
  export type TripType = 'roundtrip' | 'oneway' | 'recent';