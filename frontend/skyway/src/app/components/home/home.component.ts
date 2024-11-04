import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../flight-search/flight-search.component';
import { FeaturedDestinationsComponent } from '../featured-destinations/featured-destinations.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SearchComponent,
    HttpClientModule,
    FeaturedDestinationsComponent
  ]
})
export class HomeComponent {}