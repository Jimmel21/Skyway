import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, map, startWith, of } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';

// Material Imports

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

// Services and Interfaces
import { AirportService, Airport } from '../../services/airport.service';
import { APP_CONFIG } from '../../config/app.config';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    HttpClientModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
  ],
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.scss']
})
export class SearchComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private airportService = inject(AirportService);

  searchForm!: FormGroup;
  tripType: 'roundtrip' | 'oneway' | 'recent' = 'roundtrip';
  airports: Airport[] = [];
  filteredOrigins: Observable<Airport[]> = of([]);
  filteredDestinations: Observable<Airport[]> = of([]);

  ngOnInit(): void {
    this.initForm();
    this.loadAirports();
    this.setupFormListeners();
  }

  private initForm(): void {
    this.searchForm = this.fb.group({
      from: ['', [Validators.required]],
      to: ['', [Validators.required]],
      guests: ['1 Guest', Validators.required],
      departDate: ['', Validators.required],
      returnDate: ['']
    });
  }

  private setupFormListeners(): void {
    // Setup autocomplete filtering
    this.filteredOrigins = this.searchForm.get('from')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterAirports(value, 'from'))
    );

    this.filteredDestinations = this.searchForm.get('to')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterAirports(value, 'to'))
    );

    // Add validator for same airport selection
    this.searchForm.get('to')?.valueChanges.subscribe(() => {
      this.validateDifferentAirports();
    });

    this.searchForm.get('from')?.valueChanges.subscribe(() => {
      this.validateDifferentAirports();
    });

    // Update return date validator based on trip type
    if (this.tripType === 'roundtrip') {
      this.searchForm.get('returnDate')?.addValidators(Validators.required);
    }
  }

  private loadAirports(): void {
    this.airportService.getAirports().subscribe({
      next: (airports) => {
        this.airports = airports;
      },
      error: (error) => {
        console.error('Error loading airports:', error);
      }
    });
  }

  private _filterAirports(value: any, field: 'from' | 'to'): Airport[] {
    // If value is already an Airport object, don't filter
    if (typeof value === 'object') return this.getAvailableAirports(field);
    
    const filterValue = (typeof value === 'string' ? value : '').toLowerCase();
    return this.getAvailableAirports(field).filter(airport => 
      airport.display_name.toLowerCase().includes(filterValue) ||
      airport.code.toLowerCase().includes(filterValue) ||
      airport.city.toLowerCase().includes(filterValue)
    );
  }

  private getAvailableAirports(field: 'from' | 'to'): Airport[] {
    const otherField = field === 'from' ? 'to' : 'from';
    const otherValue = this.searchForm.get(otherField)?.value as Airport;

    if (otherValue?.id) {
      return this.airports.filter(airport => airport.id !== otherValue.id);
    }

    return this.airports;
  }

  private validateDifferentAirports(): void {
    const fromAirport = this.searchForm.get('from')?.value as Airport;
    const toAirport = this.searchForm.get('to')?.value as Airport;

    if (fromAirport && toAirport && fromAirport.id === toAirport.id) {
      this.searchForm.get('to')?.setErrors({ sameAirport: true });
    } else {
      // Clear the sameAirport error if it exists
      const currentErrors = this.searchForm.get('to')?.errors;
      if (currentErrors) {
        delete currentErrors['sameAirport'];
        const remainingErrors = Object.keys(currentErrors).length > 0 ? currentErrors : null;
        this.searchForm.get('to')?.setErrors(remainingErrors);
      }
    }
  }

  onTripTypeChange(type: 'roundtrip' | 'oneway' | 'recent'): void {
    this.tripType = type;
    const returnDateControl = this.searchForm.get('returnDate');

    if (type === 'roundtrip') {
      returnDateControl?.addValidators(Validators.required);
    } else {
      returnDateControl?.removeValidators(Validators.required);
      returnDateControl?.setValue('');
    }
    returnDateControl?.updateValueAndValidity();
  }

  displayFn(airport: Airport | null): string {
    return airport ? airport.display_name : '';
  }

  onSearch(): void {
    if (this.searchForm.valid) {
      const formValue = this.searchForm.value;
      const searchData = {
        origin_id: formValue.from.id,
        destination_id: formValue.to.id,
        date: formValue.departDate,
        return_date: this.tripType === 'roundtrip' ? formValue.returnDate : null,
        passengers: parseInt(formValue.guests.split(' ')[0])
      };

      this.airportService.searchFlights(searchData).subscribe({
        next: (results) => {
          this.router.navigate(['/flights'], { state: { searchResults: results } });
        },
        error: (error) => {
          console.error('Error searching flights:', error);
        }
      });
    } else {
      Object.keys(this.searchForm.controls).forEach(key => {
        const control = this.searchForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.searchForm.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'This field is required';
    }
    
    if (control.hasError('sameAirport')) {
      return 'Destination must be different from origin';
    }

    return '';
  }
}