import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../core/services/orders.service';
import { Order } from '../../core/models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <header class="page-head">
      <span class="eyebrow">Orders</span>
      <h1>All orders</h1>
      <p class="muted">Update order statuses and review fulfilment.</p>
    </header>

    @if (loading()) { <p class="muted">Loading…</p> }
    @else {
      <div class="card-block">
        <table>
          <thead>
            <tr>
              <th>Order</th><th>Customer</th><th>Items</th><th>Total</th>
              <th>Payment</th><th>Status</th><th>Placed</th>
            </tr>
          </thead>
          <tbody>
            @for (o of orders(); track o._id) {
              <tr>
                <td><strong>#{{ o._id.slice(-8).toUpperCase() }}</strong></td>
                <td>
                  <strong>{{ getName(o.user) }}</strong><br>
                  <span class="muted small">{{ getEmail(o.user) }}</span>
                </td>
                <td>{{ o.items.length }}</td>
                <td>{{ o.total | currency:'USD':'symbol':'1.0-0' }}</td>
                <td>
                  <span class="badge" [ngClass]="paymentBadge(o.payment.status)">
                    {{ o.payment.status }}
                  </span>
                </td>
                <td>
                  <select
                    [ngModel]="o.status"
                    (ngModelChange)="updateStatus(o, $event)"
                    [disabled]="updating() === o._id"
                    class="status-select">
                    @for (s of statuses; track s) {
                      <option [ngValue]="s">{{ statusLabel(s) }}</option>
                    }
                  </select>
                </td>
                <td class="muted small">{{ o.createdAt | date:'medium' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    .page-head { margin-bottom: 2rem; }
    .page-head h1 { margin: 0.4rem 0 0.3rem; }
    .card-block {
      background: white;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .small { font-size: 0.78rem; }
    .status-select { padding: 0.5rem 0.65rem; font-size: 0.85rem; }
  `],
})
export class AdminOrdersComponent implements OnInit {
  private ordersService = inject(OrdersService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  updating = signal<string | null>(null);

  statuses: Order['status'][] = [
    'pending_payment',
    'paid',
    'failed',
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ];

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading.set(true);
    this.ordersService.listAll().subscribe({
      next: (o) => {
        this.orders.set(o);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  updateStatus(order: Order, status: Order['status']): void {
    if (status === 'pending_payment') return;
    this.updating.set(order._id);
    this.ordersService.updateStatus(order._id, status).subscribe({
      next: (updated) => {
        this.orders.update((list) => list.map((o) => (o._id === order._id ? updated : o)));
        this.updating.set(null);
      },
      error: () => this.updating.set(null),
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

  paymentBadge(s: string): string {
    if (s === 'success') return 'badge-success';
    if (s === 'failure') return 'badge-danger';
    if (s === 'pending') return 'badge-warning';
    return '';
  }

  getName(user: any): string {
    if (!user) return '—';
    if (typeof user === 'string') return user.slice(-6);
    return user.name || '—';
  }

  getEmail(user: any): string {
    if (!user || typeof user === 'string') return '';
    return user.email || '';
  }
}
