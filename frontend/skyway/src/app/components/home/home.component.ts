import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { FeaturedDestinationsComponent } from '../featured-destinations/featured-destinations.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    FeaturedDestinationsComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  searchForm: FormGroup;
  tripType: 'roundtrip' | 'oneway' | 'recent' = 'roundtrip';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.searchForm = this.initializeForm(); // Move initialization here
  }

  private initializeForm(): FormGroup {
    return this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      guests: [1, [Validators.required, Validators.min(1)]],
      departDate: [null, Validators.required],
      returnDate: [null]
    });
  }

  // Form Control Getters
  get fromControl() { return this.searchForm.get('from'); }
  get toControl() { return this.searchForm.get('to'); }
  get guestsControl() { return this.searchForm.get('guests'); }
  get departDateControl() { return this.searchForm.get('departDate'); }
  get returnDateControl() { return this.searchForm.get('returnDate'); }

  onTripTypeChange(type: 'roundtrip' | 'oneway' | 'recent') {
    this.tripType = type;
    if (type === 'roundtrip') {
      this.searchForm.get('returnDate')?.setValidators([Validators.required]);
    } else {
      this.searchForm.get('returnDate')?.clearValidators();
      this.searchForm.get('returnDate')?.setValue(null);
    }
    this.searchForm.get('returnDate')?.updateValueAndValidity();
  }

  onSearch() {
    if (this.searchForm.valid) {
      const formData = this.searchForm.value;
      this.router.navigate(['/flights'], { 
        queryParams: {
          ...formData,
          departDate: formData.departDate?.toISOString(),
          returnDate: formData.returnDate?.toISOString(),
          tripType: this.tripType
        }
      });
    } else {
      this.markFormGroupTouched(this.searchForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
