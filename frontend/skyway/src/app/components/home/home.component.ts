import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../flight-search/flight-search.component';
import { FeaturedDestinationsComponent } from '../featured-destinations/featured-destinations.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SearchComponent,
    FeaturedDestinationsComponent
  ]
})
export class HomeComponent {}