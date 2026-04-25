import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AdminStats } from '../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink],
  template: `
    <header class="page-head">
      <span class="eyebrow">Overview</span>
      <h1>Dashboard</h1>
      <p class="muted">A snapshot of your atelier's activity.</p>
    </header>

    @if (loading()) {
      <p class="muted">Loading…</p>
    } @else if (stats()) {
      <div class="stats">
        <div class="stat">
          <span class="label">Revenue (paid)</span>
          <strong>{{ stats()!.revenue | currency:'USD':'symbol':'1.0-0' }}</strong>
        </div>
        <div class="stat">
          <span class="label">Orders</span>
          <strong>{{ stats()!.totalOrders }}</strong>
        </div>
        <div class="stat">
          <span class="label">Products</span>
          <strong>{{ stats()!.totalProducts }}</strong>
        </div>
        <div class="stat">
          <span class="label">Customers</span>
          <strong>{{ stats()!.totalUsers }}</strong>
        </div>
      </div>

      <div class="grid">
        <section class="block">
          <header class="block-head">
            <h3>Recent orders</h3>
            <a routerLink="/admin/orders" class="btn btn-ghost btn-sm">View all →</a>
          </header>
          @if (stats()!.recentOrders.length === 0) {
            <p class="muted">No orders yet.</p>
          } @else {
            <table>
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th><th>Placed</th></tr>
              </thead>
              <tbody>
                @for (o of stats()!.recentOrders; track o._id) {
                  <tr>
                    <td>#{{ o._id.slice(-6).toUpperCase() }}</td>
                    <td>{{ getCustomerName(o.user) }}</td>
                    <td><span class="badge badge-ink">{{ o.status }}</span></td>
                    <td><strong>{{ o.total | currency:'USD':'symbol':'1.0-0' }}</strong></td>
                    <td class="muted">{{ o.createdAt | date:'mediumDate' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </section>

        <section class="block">
          <header class="block-head">
            <h3>Low stock</h3>
            <a routerLink="/admin/products" class="btn btn-ghost btn-sm">Manage →</a>
          </header>
          @if (stats()!.lowStock.length === 0) {
            <p class="muted">All references are well stocked.</p>
          } @else {
            <table>
              <thead><tr><th>Product</th><th>Brand</th><th>Stock</th></tr></thead>
              <tbody>
                @for (p of stats()!.lowStock; track p._id) {
                  <tr>
                    <td>{{ p.name }}</td>
                    <td class="muted">{{ p.brand }}</td>
                    <td><span class="badge badge-warning">{{ p.stock }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </section>
      </div>
    }
  `,
  styles: [`
    .page-head { margin-bottom: 2rem; }
    .page-head h1 { margin: 0.4rem 0; }
    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 2.5rem;
    }
    .stat {
      background: white;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .stat .label {
      font-size: 0.7rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--muted);
      font-weight: 600;
    }
    .stat strong {
      font-family: var(--serif);
      font-size: 1.8rem;
      font-weight: 600;
    }
    .grid {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: 1.5rem;
    }
    .block {
      background: white;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .block-head {
      padding: 1.25rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--line);
    }
    .block-head h3 { margin: 0; font-size: 1.1rem; }
    @media (max-width: 1000px) {
      .stats { grid-template-columns: repeat(2, 1fr); }
      .grid { grid-template-columns: 1fr; }
    }
  `],
})
export class AdminDashboardComponent implements OnInit {
  private admin = inject(AdminService);
  stats = signal<AdminStats | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.admin.stats().subscribe({
      next: (s) => {
        this.stats.set(s);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getCustomerName(user: any): string {
    if (!user) return '—';
    if (typeof user === 'string') return user.slice(-6);
    return user.name || user.email || '—';
  }
}
