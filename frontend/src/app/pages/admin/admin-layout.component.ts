import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <section class="admin-shell container">
      <aside class="admin-nav">
        <span class="eyebrow">Atelier admin</span>
        <h2>Console</h2>
        <nav>
          <a routerLink="/admin/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/admin/products" routerLinkActive="active">Products</a>
          <a routerLink="/admin/orders" routerLinkActive="active">Orders</a>
        </nav>
      </aside>
      <div class="admin-content">
        <router-outlet></router-outlet>
      </div>
    </section>
  `,
  styles: [`
    .admin-shell {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 3rem;
      padding: 3rem 1.5rem;
      align-items: start;
    }
    .admin-nav {
      position: sticky;
      top: 90px;
      padding: 1.5rem;
      background: white;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
    }
    .admin-nav h2 { margin: 0.4rem 0 1.5rem; font-size: 1.4rem; }
    .admin-nav nav { display: flex; flex-direction: column; gap: 0.25rem; }
    .admin-nav nav a {
      padding: 0.7rem 0.95rem;
      border-radius: var(--radius);
      font-size: 0.92rem;
      color: var(--ink-soft);
      transition: all 0.2s;
    }
    .admin-nav nav a:hover { background: var(--accent-soft); color: var(--accent-deep); }
    .admin-nav nav a.active { background: var(--ink); color: white; }
    @media (max-width: 800px) {
      .admin-shell { grid-template-columns: 1fr; }
      .admin-nav { position: static; }
    }
  `],
})
export class AdminLayoutComponent {}
