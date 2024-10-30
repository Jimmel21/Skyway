
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar color="primary" class="header">
      <a [routerLink]="['/']" class="logo">SkyWay</a>
      <div class="nav-links">
        <a [routerLink]="['/search']">Search</a>
        <a [routerLink]="['/my-trips']">My Trips</a>
      </div>
    </mat-toolbar>
    
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      padding: 0 2rem;
      border-bottom: 1px solid #e5e7eb;
      background-color: white;
    }

    .logo {
      color: #DC2626;
      font-weight: bold;
      text-decoration: none;
      font-size: 1.5rem;
    }

    .nav-links {
      display: flex;
      gap: 2rem;

      a {
        color: #4B5563;
        text-decoration: none;
        
        &:hover {
          color: #DC2626;
        }
      }
    }

    main {
      min-height: calc(100vh - 64px);
      background-color: #F9FAFB;
    }
  `]
})
export class AppComponent {
  title = 'skyway';
}