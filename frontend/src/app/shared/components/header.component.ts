import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <div class="container header-inner">
        <a routerLink="/" class="brand">
          <span class="brand-mark">M</span>
          <span class="brand-name">
            <span class="brand-line-1">Maison</span>
            <span class="brand-line-2">Tempus</span>
          </span>
        </a>

        <nav class="nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
          <a routerLink="/shop" routerLinkActive="active">Atelier</a>
          @if (auth.isAuthenticated()) {
            <a routerLink="/orders" routerLinkActive="active">Orders</a>
          }
          @if (auth.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="active" class="admin-link">Admin</a>
          }
        </nav>

        <div class="actions">
          <a routerLink="/cart" class="cart-link" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3h2l2.5 12.5a2 2 0 002 1.5h8.5a2 2 0 002-1.5L21 7H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>
            @if (cart.itemCount() > 0) {
              <span class="cart-badge">{{ cart.itemCount() }}</span>
            }
          </a>

          @if (auth.isAuthenticated()) {
            <div class="account">
              <span class="account-name">{{ auth.user()?.name }}</span>
              <button class="btn btn-sm btn-ghost" (click)="logout()">Sign out</button>
            </div>
          } @else {
            <a routerLink="/login" class="btn btn-sm btn-ghost">Sign in</a>
            <a routerLink="/register" class="btn btn-sm">Join</a>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .site-header {
      background: var(--surface);
      border-bottom: 1px solid var(--line);
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(10px);
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      padding: 1rem 1.5rem;
      max-width: 1280px;
      margin: 0 auto;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }
    .brand-mark {
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ink);
      color: var(--accent-soft);
      font-family: var(--serif);
      font-size: 1.4rem;
      border-radius: 50%;
    }
    .brand-name {
      display: flex;
      flex-direction: column;
      line-height: 1;
    }
    .brand-line-1 {
      font-family: var(--serif);
      font-size: 1.05rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .brand-line-2 {
      font-size: 0.65rem;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      color: var(--accent);
      margin-top: 2px;
    }
    .nav {
      display: flex;
      gap: 1.75rem;
      align-items: center;
    }
    .nav a {
      font-size: 0.85rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      font-weight: 500;
      color: var(--ink-soft);
      position: relative;
      padding: 0.5rem 0;
    }
    .nav a.active, .nav a:hover { color: var(--ink); }
    .nav a.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0; right: 0;
      height: 2px;
      background: var(--accent);
    }
    .admin-link { color: var(--accent) !important; }
    .actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .cart-link {
      position: relative;
      padding: 0.6rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s;
    }
    .cart-link:hover { background: var(--accent-soft); }
    .cart-badge {
      position: absolute;
      top: 0;
      right: 0;
      background: var(--accent-deep);
      color: white;
      font-size: 0.62rem;
      font-weight: 600;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .account {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .account-name {
      font-size: 0.82rem;
      color: var(--ink-soft);
      font-weight: 500;
    }
    @media (max-width: 768px) {
      .nav { display: none; }
      .account-name { display: none; }
    }
  `],
})
export class HeaderComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
  private router = inject(Router);

  constructor() {
    this.cart.refreshIfAuthed();
  }

  logout(): void {
    this.auth.logout();
    this.cart.reset();
    this.router.navigate(['/']);
  }
}
