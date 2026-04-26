import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <div class="container header-inner">
        <a routerLink="/" class="brand" (click)="closeMenu()">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="7.5"/>
              <path d="M12 8v4l2.5 1.6"/>
              <path d="M9 2.5h6M9 21.5h6"/>
            </svg>
          </span>
          <span class="brand-name">
            <span class="brand-line-1">Watch</span>
            <span class="brand-line-2">Hub</span>
          </span>
        </a>

        <nav class="nav" aria-label="Primary">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
          <a routerLink="/shop" routerLinkActive="active">Shop</a>
          @if (auth.isAuthenticated()) {
            <a routerLink="/orders" routerLinkActive="active">Orders</a>
          }
          @if (auth.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="active" class="admin-link">Admin</a>
          }
        </nav>

        <div class="actions">
          <a routerLink="/cart" class="cart-link" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h2l2.5 12.5a2 2 0 002 1.5h8.5a2 2 0 002-1.5L21 7H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>
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
            <a routerLink="/login" class="btn btn-sm btn-ghost desktop-only">Sign in</a>
            <a routerLink="/register" class="btn btn-sm desktop-only">Join</a>
          }

          <button class="menu-toggle" (click)="toggleMenu()" [attr.aria-expanded]="menuOpen()" aria-label="Open menu">
            @if (menuOpen()) {
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M6 18L18 6"/></svg>
            } @else {
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
            }
          </button>
        </div>
      </div>

      @if (menuOpen()) {
        <nav class="mobile-nav" aria-label="Mobile">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="closeMenu()">Home</a>
          <a routerLink="/shop" routerLinkActive="active" (click)="closeMenu()">Shop</a>
          @if (auth.isAuthenticated()) {
            <a routerLink="/orders" routerLinkActive="active" (click)="closeMenu()">My orders</a>
          }
          @if (auth.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="active" (click)="closeMenu()" class="admin-link">Admin console</a>
          }
          <div class="mobile-actions">
            @if (auth.isAuthenticated()) {
              <span class="mobile-user">Signed in as <strong>{{ auth.user()?.name }}</strong></span>
              <button class="btn btn-block btn-outline" (click)="logout()">Sign out</button>
            } @else {
              <a routerLink="/login" class="btn btn-block btn-outline" (click)="closeMenu()">Sign in</a>
              <a routerLink="/register" class="btn btn-block" (click)="closeMenu()">Join the hub</a>
            }
          </div>
        </nav>
      }
    </header>
  `,
  styles: [`
    .site-header {
      background: rgba(255, 255, 255, 0.92);
      border-bottom: 1px solid var(--line);
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: saturate(180%) blur(14px);
      -webkit-backdrop-filter: saturate(180%) blur(14px);
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.25rem;
      padding: 0.85rem var(--container-pad);
      max-width: 1280px;
      margin: 0 auto;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      flex-shrink: 0;
    }
    .brand-mark {
      width: 38px; height: 38px;
      display: inline-flex; align-items: center; justify-content: center;
      background: var(--ink); color: var(--accent);
      border-radius: 50%;
    }
    .brand-name {
      display: flex; flex-direction: column; line-height: 1;
    }
    .brand-line-1 {
      font-family: var(--serif);
      font-size: 1.15rem; font-weight: 600;
      letter-spacing: -0.01em; color: var(--ink);
    }
    .brand-line-2 {
      font-size: 0.62rem;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      color: var(--accent);
      margin-top: 3px;
      font-weight: 700;
    }
    .nav {
      display: flex; gap: 1.85rem; align-items: center;
    }
    .nav a {
      font-size: 0.82rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 600;
      color: var(--ink-soft);
      position: relative;
      padding: 0.5rem 0;
    }
    .nav a.active, .nav a:hover { color: var(--ink); }
    .nav a.active::after {
      content: '';
      position: absolute; bottom: -2px; left: 0; right: 0;
      height: 2px; background: var(--accent);
    }
    .admin-link { color: var(--accent) !important; }
    .actions {
      display: flex; align-items: center; gap: 0.4rem;
    }
    .cart-link {
      position: relative;
      width: 42px; height: 42px;
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 50%; transition: background 0.2s;
      color: var(--ink);
    }
    .cart-link:hover { background: var(--accent-soft); }
    .cart-badge {
      position: absolute; top: 4px; right: 4px;
      background: var(--accent-deep); color: white;
      font-size: 0.62rem; font-weight: 700;
      width: 18px; height: 18px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .account {
      display: flex; align-items: center; gap: 0.5rem;
    }
    .account-name {
      font-size: 0.82rem; color: var(--ink-soft); font-weight: 500;
      max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .menu-toggle {
      display: none;
      background: transparent; border: 1px solid var(--line-strong);
      color: var(--ink); width: 42px; height: 42px;
      padding: 0; min-height: 0;
      border-radius: 10px;
    }
    .menu-toggle:hover { background: var(--accent-soft); border-color: var(--accent); }
    .mobile-nav {
      display: none;
      flex-direction: column;
      padding: 0.75rem var(--container-pad) 1.25rem;
      border-top: 1px solid var(--line);
      background: white;
      animation: dropDown 0.2s ease-out;
    }
    @keyframes dropDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
    .mobile-nav a {
      padding: 0.95rem 0.5rem;
      border-bottom: 1px solid var(--line);
      font-size: 0.95rem; font-weight: 500;
      color: var(--ink); letter-spacing: 0.02em;
    }
    .mobile-nav a.active { color: var(--accent-deep); }
    .mobile-actions { display: flex; flex-direction: column; gap: 0.6rem; padding-top: 1rem; }
    .mobile-user { font-size: 0.85rem; color: var(--ink-soft); padding: 0.25rem 0.5rem; }
    .mobile-user strong { color: var(--ink); }

    @media (max-width: 860px) {
      .nav { display: none; }
      .desktop-only { display: none; }
      .menu-toggle { display: inline-flex; align-items: center; justify-content: center; }
      .mobile-nav { display: flex; }
      .account-name { display: none; }
      .account .btn { display: none; }
    }
    @media (max-width: 420px) {
      .brand-line-1 { font-size: 1rem; }
      .brand-line-2 { font-size: 0.58rem; letter-spacing: 0.28em; }
      .brand-mark { width: 34px; height: 34px; }
    }
  `],
})
export class HeaderComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
  private router = inject(Router);

  menuOpen = signal(false);

  constructor() {
    this.cart.refreshIfAuthed();
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.menuOpen.set(false));
  }

  toggleMenu(): void { this.menuOpen.update((v) => !v); }
  closeMenu(): void { this.menuOpen.set(false); }

  @HostListener('window:keydown.escape')
  onEsc(): void { this.menuOpen.set(false); }

  logout(): void {
    this.auth.logout();
    this.cart.reset();
    this.menuOpen.set(false);
    this.router.navigate(['/']);
  }
}
