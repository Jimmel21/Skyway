import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClientModule } from '@angular/common/http';

import { AirportService, Airport, FlightSearchRequest, FlightSearchResponse, Flight } from '../../services/airport.service';

@Component({
  selector: 'app-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ]
})
export class SearchComponent implements OnInit {
  searchForm!: FormGroup;
  tripType: 'roundtrip' | 'oneway' | 'recent' = 'roundtrip';
  airports: Airport[] = [];
  filteredOrigins: Observable<Airport[]>;
  filteredDestinations: Observable<Airport[]>;
  isLoading = false;
  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private airportService: AirportService
  ) {
    this.filteredOrigins = new Observable<Airport[]>();
    this.filteredDestinations = new Observable<Airport[]>();
  }

  ngOnInit(): void {
    this.initForm();
    this.loadAirports();
    this.setupFormListeners();
  }

  private initForm(): void {
    this.searchForm = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      guests: ['1 Guest', Validators.required],
      departDate: ['', Validators.required],
      returnDate: this.tripType === 'roundtrip' ? ['', Validators.required] : ['']
    });
  }

  private loadAirports(): void {
    this.airportService.getAirports().subscribe({
      next: (airports) => {
        this.airports = airports;
        this.setupAutoComplete();
      },
      error: (error) => console.error('Error loading airports:', error)
    });
  }

  private setupAutoComplete(): void {
    this.filteredOrigins = this.searchForm.get('from')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterAirports(value))
    );

    this.filteredDestinations = this.searchForm.get('to')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterAirports(value))
    );
  }

  private setupFormListeners(): void {
    // Listen for from/to field changes
    this.searchForm.get('from')?.valueChanges.subscribe(() => {
      this.validateDifferentAirports();
    });

    this.searchForm.get('to')?.valueChanges.subscribe(() => {
      this.validateDifferentAirports();
    });

    // Listen for departure date changes
    this.searchForm.get('departDate')?.valueChanges.subscribe(date => {
      if (date && this.tripType === 'roundtrip') {
        const returnDateControl = this.searchForm.get('returnDate');
        const returnDate = returnDateControl?.value;
        
        if (returnDate && new Date(returnDate) < new Date(date)) {
          returnDateControl?.setValue('');
        }
        
        returnDateControl?.setValidators([
          Validators.required,
          this.returnDateValidator(date)
        ]);
        returnDateControl?.updateValueAndValidity();
      }
    });
  }

  private _filterAirports(value: string | Airport): Airport[] {
    const filterValue = typeof value === 'string' 
      ? value.toLowerCase() 
      : value?.display_name?.toLowerCase() || '';

    return this.airports.filter(airport => {
      const matchesDisplayName = airport.display_name.toLowerCase().includes(filterValue);
      const matchesCode = airport.code.toLowerCase().includes(filterValue);
      const matchesCity = airport.city.toLowerCase().includes(filterValue);
      return (matchesDisplayName || matchesCode || matchesCity) && airport.is_active;
    });
  }

  private validateDifferentAirports(): void {
    const fromValue = this.searchForm.get('from')?.value as Airport;
    const toValue = this.searchForm.get('to')?.value as Airport;

    if (fromValue && toValue && fromValue.id === toValue.id) {
      this.searchForm.get('to')?.setErrors({ sameAirport: true });
    } else {
      const currentErrors = this.searchForm.get('to')?.errors;
      if (currentErrors) {
        delete currentErrors['sameAirport'];
        const remainingErrors = Object.keys(currentErrors).length > 0 ? currentErrors : null;
        this.searchForm.get('to')?.setErrors(remainingErrors);
      }
    }
  }

  private returnDateValidator(departDate: string) {
    return (control: any) => {
      if (!control.value) return null;
      
      const returnDate = new Date(control.value);
      const departureDate = new Date(departDate);
      
      return returnDate >= departureDate 
        ? null 
        : { returnDateBeforeDeparture: true };
    };
  }

  onTripTypeChange(type: 'roundtrip' | 'oneway' | 'recent'): void {
    this.tripType = type;
    const returnDateControl = this.searchForm.get('returnDate');
    
    if (type === 'roundtrip') {
      returnDateControl?.setValidators([
        Validators.required,
        this.returnDateValidator(this.searchForm.get('departDate')?.value)
      ]);
    } else {
      returnDateControl?.clearValidators();
      returnDateControl?.setValue('');
    }
    returnDateControl?.updateValueAndValidity();
  }

  displayFn(airport: Airport): string {
    return airport ? airport.display_name : '';
  }

  getErrorMessage(fieldName: string): string {
    const control = this.searchForm.get(fieldName);
    if (!control || !control.errors) return '';

    if (control.hasError('required')) {
      return 'This field is required';
    }
    if (control.hasError('sameAirport')) {
      return 'Departure and arrival airports must be different';
    }
    if (control.hasError('returnDateBeforeDeparture')) {
      return 'Return date must be after departure date';
    }
    return '';
  }

  // async onSearch(): Promise<void> {
  //   if (this.searchForm.valid) {
  //     this.isLoading = true;
  //     const formValue = this.searchForm.value;
      
  //     const searchData: FlightSearchRequest = {
  //       departure_city: formValue.from.display_name,
  //       arrival_city: formValue.to.display_name,
  //       date: formValue.departDate,
  //       return_date: this.tripType === 'roundtrip' ? formValue.returnDate : null,
  //       passengers: parseInt(formValue.guests.split(' ')[0])
  //     };

  //     try {
  //       this.airportService.searchFlights(searchData).subscribe({
  //         next: (response: FlightSearchResponse) => {
  //           this.router.navigate(['/flights'], { 
  //             state: { 
  //               searchResults: response.flights,
  //               returnFlights: response.returnFlights,
  //               searchCriteria: {
  //                 ...searchData,
  //                 tripType: this.tripType
  //               }
  //             }
  //           });
  //         },
  //         error: (error) => {
  //           console.error('Error searching flights:', error);
  //           this.router.navigate(['/flights'], { 
  //             state: { 
  //               searchResults: [],
  //               returnFlights: [],
  //               searchCriteria: {
  //                 ...searchData,
  //                 tripType: this.tripType
  //               },
  //               error: 'Unable to find flights matching your criteria'
  //             }
  //           });
  //         },
  //         complete: () => {
  //           this.isLoading = false;
  //         }
  //       });
  //     } catch (error) {
  //       console.error('Error processing search:', error);
  //       this.isLoading = false;
  //     }
  //   } else {
  //     Object.keys(this.searchForm.controls).forEach(key => {
  //       const control = this.searchForm.get(key);
  //       if (control?.invalid) {
  //         control.markAsTouched();
  //       }
  //     });
  //   }
  // }


  async onSearch(): Promise<void> {
    if (this.searchForm.valid) {
      this.isLoading = true;
      const formValue = this.searchForm.value;
      
      try {
        // Validate form values
        if (!formValue.from?.id || !formValue.to?.id) {
          throw new Error('Please select valid airports');
        }

        // Prepare search data
        const searchData: FlightSearchRequest = {
          origin_id: formValue.from.id,
          destination_id: formValue.to.id,
          date: this.formatDate(formValue.departDate)
        };

        if (this.tripType === 'roundtrip' && formValue.returnDate) {
          searchData.return_date = this.formatDate(formValue.returnDate);
        }

        if (formValue.guests) {
          searchData.passengers = parseInt(formValue.guests.split(' ')[0]) || 1;
        }

  
        console.log('Sending search request:', searchData);

        this.airportService.searchFlights(searchData).subscribe({
          next: (response: FlightSearchResponse) => {
            console.log('Raw API Response:', response);

            console.log('Outbound Flights:', response.outboundFlights); 

            const navigationState = {
              searchResults: response.outboundFlights, // or response.flights?
              returnFlights: response.returnFlights || [],
              searchCriteria: {
                ...searchData,
                originName: formValue.from.display_name,
                destinationName: formValue.to.display_name,
                tripType: this.tripType
              }
            };
        
            console.log('Navigation State being sent:', navigationState);
            this.router.navigate(['/flights'], { 
              state: { 
                searchResults: response.outboundFlights,
                returnFlights: response.returnFlights || [],
                searchCriteria: {
                  ...searchData,
                  tripType: this.tripType,
                  originName: formValue.from.display_name,
                  destinationName: formValue.to.display_name
                }
              }
            });
          },
          error: (error) => {
            console.error('Error searching flights:', error);
            this.router.navigate(['/flights'], { 
              state: { 
                searchResults: [],
                returnFlights: [],
                searchCriteria: {
                  ...searchData,
                  tripType: this.tripType,
                  originName: formValue.from.display_name,
                  destinationName: formValue.to.display_name
                },
                error: error.error?.message || 'Unable to find flights matching your criteria'
              }
            });
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      } catch (error) {
        console.error('Error processing search:', error);
        this.isLoading = false;
      }
    } else {
      Object.keys(this.searchForm.controls).forEach(key => {
        const control = this.searchForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  private formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}