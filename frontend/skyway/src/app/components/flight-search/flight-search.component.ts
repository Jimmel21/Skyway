import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class SearchComponent implements OnInit {
  searchForm: FormGroup;
  tripType: 'roundtrip' | 'oneway' | 'recent' = 'roundtrip';

  constructor(private fb: FormBuilder, private router: Router) {
    this.searchForm = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      guests: ['1 Guest', Validators.required],
      departDate: ['', Validators.required],
      returnDate: ['']
    });
  }

  ngOnInit(): void {}

  onTripTypeChange(type: 'roundtrip' | 'oneway' | 'recent'): void {
    this.tripType = type;
    if (type === 'roundtrip') {
      this.searchForm.get('returnDate')?.setValidators(Validators.required);
    } else {
      this.searchForm.get('returnDate')?.clearValidators();
    }
    this.searchForm.get('returnDate')?.updateValueAndValidity();
  }

  onSearch(): void {
    if (this.searchForm.valid) {
      this.router.navigate(['/flight-results']);
    }
  }
}