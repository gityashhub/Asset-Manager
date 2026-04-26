import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../core/services/orders.service';
import { Order } from '../../core/models';

type StatusFilter = 'all' | Order['status'];

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <header class="page-head">
      <div>
        <span class="eyebrow">Orders</span>
        <h1>Customer orders</h1>
        <p class="muted">Review every order placed at the atelier and update fulfilment status.</p>
      </div>
      <button type="button" class="btn btn-ghost" (click)="fetch()" [disabled]="loading()">
        @if (loading()) { Refreshing… } @else { ↻ Refresh }
      </button>
    </header>

    <div class="toolbar">
      <div class="counts">
        <span class="count-pill">
          <strong>{{ orders().length }}</strong> total
        </span>
        <span class="count-pill paid">
          <strong>{{ paidCount() }}</strong> paid
        </span>
        <span class="count-pill pending">
          <strong>{{ pendingCount() }}</strong> awaiting
        </span>
      </div>
      <div class="filter">
        <label for="statusFilter" class="muted small">Filter</label>
        <select id="statusFilter" [(ngModel)]="filter" class="status-select">
          <option value="all">All statuses</option>
          @for (s of statuses; track s) {
            <option [value]="s">{{ statusLabel(s) }}</option>
          }
        </select>
      </div>
    </div>

    @if (loading()) {
      <div class="state-card"><p class="muted">Loading customer orders…</p></div>
    } @else if (errorMessage()) {
      <div class="state-card error">
        <strong>Could not load orders.</strong>
        <p class="muted">{{ errorMessage() }}</p>
        <button class="btn btn-dark" (click)="fetch()">Try again</button>
      </div>
    } @else if (orders().length === 0) {
      <div class="state-card">
        <strong>No customer orders yet.</strong>
        <p class="muted">Once a customer completes checkout, their order will appear here.</p>
      </div>
    } @else if (visibleOrders().length === 0) {
      <div class="state-card">
        <strong>No orders match this filter.</strong>
        <p class="muted">Try a different status filter or clear the filter to see everything.</p>
      </div>
    } @else {
      <div class="card-block">
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Placed</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (o of visibleOrders(); track o._id) {
                <tr>
                  <td><strong class="mono">#{{ o._id.slice(-8).toUpperCase() }}</strong></td>
                  <td>
                    <strong>{{ getName(o.user) }}</strong>
                    @if (getEmail(o.user)) {
                      <br><span class="muted small">{{ getEmail(o.user) }}</span>
                    }
                  </td>
                  <td>{{ itemCount(o) }}</td>
                  <td><strong>{{ o.total | currency:'USD':'symbol':'1.0-0' }}</strong></td>
                  <td>
                    <span class="badge" [ngClass]="paymentBadge(o.payment?.status)">
                      {{ o.payment?.method || '—' }} · {{ o.payment?.status || 'unpaid' }}
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
                  <td class="muted small nowrap">{{ o.createdAt | date:'medium' }}</td>
                  <td>
                    <button type="button" class="btn btn-ghost btn-sm" (click)="toggle(o._id)">
                      {{ expanded() === o._id ? 'Hide' : 'View' }}
                    </button>
                  </td>
                </tr>
                @if (expanded() === o._id) {
                  <tr class="details-row">
                    <td colspan="8">
                      <div class="details-grid">
                        <div>
                          <h4>Items</h4>
                          <ul class="items-list">
                            @for (it of o.items; track it.product) {
                              <li>
                                <strong>{{ it.name }}</strong>
                                <span class="muted small">{{ it.brand }}</span>
                                <span>{{ it.quantity }} × {{ it.price | currency:'USD':'symbol':'1.0-0' }}</span>
                              </li>
                            }
                          </ul>
                        </div>
                        <div>
                          <h4>Shipping</h4>
                          <p class="addr">
                            {{ o.shippingAddress?.fullName }}<br>
                            {{ o.shippingAddress?.line1 }}<br>
                            {{ o.shippingAddress?.city }}, {{ o.shippingAddress?.state }} {{ o.shippingAddress?.postalCode }}<br>
                            {{ o.shippingAddress?.country }}
                            @if (o.shippingAddress?.phone) { <br>{{ o.shippingAddress?.phone }} }
                          </p>
                        </div>
                        <div>
                          <h4>Totals</h4>
                          <dl class="totals">
                            <dt>Subtotal</dt><dd>{{ o.subtotal | currency:'USD':'symbol':'1.0-0' }}</dd>
                            <dt>Shipping</dt><dd>{{ o.shipping | currency:'USD':'symbol':'1.0-0' }}</dd>
                            <dt>Tax</dt><dd>{{ o.tax | currency:'USD':'symbol':'1.0-0' }}</dd>
                            <dt class="grand">Total</dt><dd class="grand">{{ o.total | currency:'USD':'symbol':'1.0-0' }}</dd>
                          </dl>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-head {
      display: flex; justify-content: space-between; align-items: flex-start;
      gap: 1rem; margin-bottom: 1.5rem;
    }
    .page-head h1 { margin: 0.4rem 0 0.3rem; }
    .toolbar {
      display: flex; justify-content: space-between; align-items: center;
      gap: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap;
    }
    .counts { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .count-pill {
      background: white; border: 1px solid var(--line);
      border-radius: 999px; padding: 0.45rem 0.95rem;
      font-size: 0.78rem; letter-spacing: 0.06em; text-transform: uppercase;
      color: var(--muted);
    }
    .count-pill strong { color: var(--ink); margin-right: 0.35rem; }
    .count-pill.paid { background: #ecfdf5; border-color: #a7f3d0; }
    .count-pill.paid strong { color: #047857; }
    .count-pill.pending { background: #fffbeb; border-color: #fcd34d; }
    .count-pill.pending strong { color: #b45309; }
    .filter { display: flex; align-items: center; gap: 0.5rem; }
    .card-block {
      background: white; border: 1px solid var(--line);
      border-radius: var(--radius-lg); overflow: hidden;
    }
    .table-scroll { overflow-x: auto; }
    .small { font-size: 0.78rem; }
    .nowrap { white-space: nowrap; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .status-select { padding: 0.5rem 0.65rem; font-size: 0.85rem; }
    .state-card {
      background: white; border: 1px dashed var(--line);
      border-radius: var(--radius-lg); padding: 2.5rem 2rem;
      text-align: center;
    }
    .state-card strong { display: block; font-size: 1.05rem; margin-bottom: 0.4rem; }
    .state-card.error { border-color: #fca5a5; background: #fef2f2; }
    .state-card .btn { margin-top: 1rem; }
    .details-row td { background: #fafaf7; padding: 1.5rem !important; }
    .details-grid {
      display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 2rem;
    }
    .details-grid h4 {
      margin: 0 0 0.6rem; font-size: 0.72rem;
      letter-spacing: 0.16em; text-transform: uppercase;
      color: var(--muted); font-weight: 600;
    }
    .items-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .items-list li {
      display: grid; grid-template-columns: 2fr 1.2fr 1fr; gap: 0.75rem;
      padding: 0.55rem 0; border-bottom: 1px solid var(--line);
    }
    .items-list li:last-child { border-bottom: none; }
    .addr { margin: 0; line-height: 1.55; font-size: 0.9rem; }
    .totals { display: grid; grid-template-columns: 1fr auto; gap: 0.35rem 1rem; margin: 0; font-size: 0.9rem; }
    .totals dt { color: var(--muted); }
    .totals dd { margin: 0; text-align: right; }
    .totals dt.grand, .totals dd.grand {
      font-weight: 700; padding-top: 0.5rem;
      border-top: 1px solid var(--line); margin-top: 0.25rem;
    }
    @media (max-width: 800px) {
      .page-head { flex-direction: column; align-items: stretch; }
      .details-grid { grid-template-columns: 1fr; gap: 1.5rem; }
    }
  `],
})
export class AdminOrdersComponent implements OnInit {
  private ordersService = inject(OrdersService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  updating = signal<string | null>(null);
  expanded = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  filter: StatusFilter = 'all';

  statuses: Order['status'][] = [
    'pending_payment',
    'confirmed',
    'paid',
    'failed',
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ];

  visibleOrders = computed(() => {
    const list = this.orders();
    if (this.filter === 'all') return list;
    return list.filter((o) => o.status === this.filter);
  });

  paidCount = computed(() => this.orders().filter((o) => o.status === 'paid' || o.status === 'delivered' || o.status === 'shipped').length);
  pendingCount = computed(() => this.orders().filter((o) => o.status === 'pending_payment' || o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing').length);

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.ordersService.listAll().subscribe({
      next: (o) => {
        this.orders.set(o || []);
        this.loading.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || 'Unable to reach the server.';
        this.errorMessage.set(msg);
        this.loading.set(false);
      },
    });
  }

  toggle(id: string): void {
    this.expanded.update((cur) => (cur === id ? null : id));
  }

  itemCount(o: Order): number {
    return (o.items || []).reduce((sum, it) => sum + (it.quantity || 0), 0);
  }

  updateStatus(order: Order, status: Order['status']): void {
    if (status === order.status) return;
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
      confirmed: 'Confirmed (COD)',
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

  paymentBadge(s: string | undefined): string {
    if (s === 'success') return 'badge-success';
    if (s === 'failure') return 'badge-danger';
    if (s === 'pending') return 'badge-warning';
    return '';
  }

  getName(user: any): string {
    if (!user) return 'Guest';
    if (typeof user === 'string') return `User ${user.slice(-6)}`;
    return user.name || user.email || 'Customer';
  }

  getEmail(user: any): string {
    if (!user || typeof user === 'string') return '';
    return user.email || '';
  }
}
