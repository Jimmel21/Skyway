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