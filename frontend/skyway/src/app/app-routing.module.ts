import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { FlightSearchComponent } from './components/flight-search/flight-search.component';
import { FlightListComponent } from './components/flight-list/flight-list.component';
import { PassengerInfoComponent } from './components/passenger-info/passenger-info.component';
import { PaymentComponent } from './components/payment/payment.component';
import { BookingConfirmationComponent } from './components/booking-confirmation/booking-confirmation.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: FlightSearchComponent },
  { path: 'flights', component: FlightListComponent },
  { path: 'passenger-info', component: PassengerInfoComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'confirmation', component: BookingConfirmationComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
