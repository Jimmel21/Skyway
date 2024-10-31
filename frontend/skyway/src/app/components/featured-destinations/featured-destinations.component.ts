import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Destination {
  city: string;
  description: string;
  imageUrl: string;
  basePrice: number;
}

@Component({
  selector: 'app-featured-destinations',
  templateUrl: './featured-destinations.component.html',
  styleUrls: ['./featured-destinations.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class FeaturedDestinationsComponent {
  destinations: Destination[] = [
    {
      city: 'New York',
      description: 'Experience the city that never sleeps',
      imageUrl: '/assets/images/new-york.jpg',
      basePrice: 299
    },
    {
      city: 'Tokyo',
      description: 'Discover the blend of tradition and future',
      imageUrl: '/assets/images/tokyo.jpg',
      basePrice: 599
    },
    {
      city: 'Paris',
      description: 'Embrace the city of love and lights',
      imageUrl: '/assets/images/paris.jpg',
      basePrice: 399
    }
  ];

  exploreDestination(city: string): void {
    console.log(`Exploring ${city}`);
  }
}