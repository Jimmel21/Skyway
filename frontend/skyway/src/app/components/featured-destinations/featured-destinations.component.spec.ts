import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedDestinationsComponent } from './featured-destinations.component';

describe('FeaturedDestinationsComponent', () => {
  let component: FeaturedDestinationsComponent;
  let fixture: ComponentFixture<FeaturedDestinationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedDestinationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturedDestinationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
