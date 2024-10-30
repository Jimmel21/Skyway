import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  searchForm: FormGroup;
  tripType: 'roundtrip' | 'oneway' | 'recent' = 'roundtrip';

  constructor(private fb: FormBuilder, private router: Router) {
    this.searchForm = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      guests: ['1', Validators.required],
      departDate: ['', Validators.required],
      returnDate: ['']
    });
  }

  onSearch(): void {
    if (this.searchForm.valid) {
      this.router.navigate(['/flights'], { 
        queryParams: this.searchForm.value 
      });
    }
  }
}