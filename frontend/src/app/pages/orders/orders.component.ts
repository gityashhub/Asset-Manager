import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdersService } from '../../core/services/orders.service';
import { Order } from '../../core/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink],
  template: `
    <section class="container section">
      <span class="eyebrow">My account</span>
      <h1>Order history</h1>

      @if (loading()) {
        <p class="muted">Loading…</p>
      } @else if (orders().length === 0) {
        <div class="empty-state">
          <h3>No orders yet</h3>
          <p>Once you place an order, it will appear here.</p>
          <a routerLink="/shop" class="btn">Browse atelier</a>
        </div>
      } @else {
        <div class="orders-list">
          @for (o of orders(); track o._id) {
            <article class="order-card">
              <header>
                <div>
                  <span class="muted small">Order</span>
                  <strong>#{{ o._id.slice(-8).toUpperCase() }}</strong>
                </div>
                <div>
                  <span class="muted small">Placed</span>
                  <strong>{{ o.createdAt | date:'mediumDate' }}</strong>
                </div>
                <div>
                  <span class="muted small">Total</span>
                  <strong>{{ o.total | currency:'USD':'symbol':'1.2-2' }}</strong>
                </div>
                <div class="status-wrap">
                  <span class="badge" [ngClass]="statusClass(o.status)">{{ statusLabel(o.status) }}</span>
                </div>
              </header>
              <div class="items">
                @for (it of o.items; track it.product) {
                  <div class="oitem">
                    @if (it.image) { <img [src]="it.image" [alt]="it.name"> }
                    <div>
                      <span class="muted small">{{ it.brand }}</span>
                      <strong>{{ it.name }}</strong>
                      <span class="muted small">Qty {{ it.quantity }} · {{ it.price | currency:'USD':'symbol':'1.0-0' }}</span>
                    </div>
                  </div>
                }
              </div>
              <footer>
                <a [routerLink]="['/orders', o._id]" class="btn btn-outline btn-sm">View details</a>
                @if (o.status === 'pending_payment') {
                  <a [routerLink]="['/payment', o._id]" class="btn btn-sm">Complete payment</a>
                }
              </footer>
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    h1 { margin-bottom: 2rem; }
    .orders-list { display: flex; flex-direction: column; gap: 1.25rem; }
    .order-card {
      background: white;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .order-card header {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr auto;
      gap: 1.5rem;
      padding: 1.25rem 1.5rem;
      background: #faf8f3;
      border-bottom: 1px solid var(--line);
      align-items: center;
    }
    .order-card header > div { display: flex; flex-direction: column; gap: 0.15rem; }
    .small { font-size: 0.72rem; }
    .items { padding: 1.25rem 1.5rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    .oitem { display: flex; gap: 0.75rem; align-items: center; }
    .oitem img { width: 50px; height: 50px; object-fit: cover; border-radius: var(--radius); background: #f5f2ec; }
    .oitem div { display: flex; flex-direction: column; gap: 0.1rem; }
    .order-card footer { padding: 1rem 1.5rem; border-top: 1px solid var(--line); display: flex; gap: 0.5rem; justify-content: flex-end; }
    .status-wrap { text-align: right; }
    @media (max-width: 700px) {
      .order-card header { grid-template-columns: 1fr 1fr; }
    }
  `],
})
export class OrdersComponent implements OnInit {
  private ordersService = inject(OrdersService);
  orders = signal<Order[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.ordersService.mine().subscribe({
      next: (o) => {
        this.orders.set(o);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  statusLabel(s: Order['status']): string {
    const map: Record<string, string> = {
      pending_payment: 'Awaiting payment',
      paid: 'Paid',
      failed: 'Payment failed',
      pending: 'Payment pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return map[s] || s;
  }

  statusClass(s: Order['status']): string {
    if (s === 'paid' || s === 'delivered' || s === 'shipped') return 'badge-success';
    if (s === 'failed' || s === 'cancelled') return 'badge-danger';
    if (s === 'pending' || s === 'pending_payment' || s === 'processing') return 'badge-warning';
    return '';
  }
}
