
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'flights',
    loadComponent: () => import('./components/flight-list/flight-list.component')
      .then(m => m.FlightResultsComponent)
  },
  {
    path: 'passenger-info',
    loadComponent: () => import('./components/passenger-info/passenger-info.component')
      .then(m => m.PassengerInfoComponent)
  },
  {
    path: 'payment',
    loadComponent: () => import('./components/payment/payment.component')
      .then(m => m.PaymentSummaryComponent)
  },
  {
    path: 'confirmation',
    loadComponent: () => import('./components/booking-confirmation/booking-confirmation.component')
      .then(m => m.BookingConfirmationComponent)
  }, 
  {
    path: 'my-trips',
    loadComponent: () => import('./components/my-trips/my-trips.component')
      .then(m => m.MyTripsComponent)
  }
];