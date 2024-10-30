// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule
  ],
  template: `
    <mat-toolbar class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="logo">SkyWay</a>
        <div class="nav-links">
          <a routerLink="/search">Search</a>
          <a routerLink="/my-trips">My Trips</a>
        </div>
      </div>
    </mat-toolbar>

    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .navbar {
      background-color: white;
      border-bottom: 1px solid #E5E7EB;
      padding: 0;
    }

    .nav-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      color: #DC2626;
      font-size: 1.5rem;
      font-weight: bold;
      text-decoration: none;
    }

    .nav-links {
      display: flex;
      gap: 2rem;
      
      a {
        color: #4B5563;
        text-decoration: none;
        font-weight: 500;
        
        &:hover {
          color: #DC2626;
        }
      }
    }

    .main-content {
      min-height: calc(100vh - 64px);
      background-color: #F9FAFB;
    }
  `]
})
export class AppComponent {
  title = 'skyway';
}