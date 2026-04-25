import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrdersService } from '../../core/services/orders.service';
import { Order } from '../../core/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink],
  template: `
    <section class="container section">
      <a routerLink="/orders" class="back">← All orders</a>

      @if (loading()) {
        <p class="muted">Loading…</p>
      } @else if (!order()) {
        <div class="empty-state"><h3>Order not found</h3></div>
      } @else {
        <div class="head">
          <div>
            <span class="eyebrow">Order #{{ order()!._id.slice(-8).toUpperCase() }}</span>
            <h1>Placed {{ order()!.createdAt | date:'fullDate' }}</h1>
          </div>
          <span class="badge" [ngClass]="statusClass(order()!.status)">{{ statusLabel(order()!.status) }}</span>
        </div>

        <div class="grid">
          <section class="items">
            <h3>Items</h3>
            @for (it of order()!.items; track it.product) {
              <div class="oitem">
                <img [src]="it.image || fallback" [alt]="it.name" (error)="onImgError($event)">
                <div class="info">
                  <span class="muted small">{{ it.brand }}</span>
                  <strong>{{ it.name }}</strong>
                  <span class="muted small">Qty {{ it.quantity }}</span>
                </div>
                <span class="line-price">{{ it.price * it.quantity | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
            }

            <div class="totals">
              <div class="row"><span>Subtotal</span><span>{{ order()!.subtotal | currency:'USD':'symbol':'1.2-2' }}</span></div>
              <div class="row"><span>Shipping</span><span>{{ order()!.shipping | currency:'USD':'symbol':'1.2-2' }}</span></div>
              <div class="row"><span>Tax</span><span>{{ order()!.tax | currency:'USD':'symbol':'1.2-2' }}</span></div>
              <div class="row total"><span>Total</span><strong>{{ order()!.total | currency:'USD':'symbol':'1.2-2' }}</strong></div>
            </div>
          </section>

          <aside class="side">
            <div class="card-block">
              <h4>Shipping to</h4>
              <p>
                <strong>{{ order()!.shippingAddress.fullName }}</strong><br>
                {{ order()!.shippingAddress.line1 }}<br>
                {{ order()!.shippingAddress.city }}, {{ order()!.shippingAddress.state }} {{ order()!.shippingAddress.postalCode }}<br>
                {{ order()!.shippingAddress.country }}
                @if (order()!.shippingAddress.phone) { <br>{{ order()!.shippingAddress.phone }} }
              </p>
            </div>

            <div class="card-block">
              <h4>Payment</h4>
              <p>
                Method: <strong>{{ methodLabel(order()!.payment.method) }}</strong><br>
                Status: <strong>{{ paymentStatusLabel(order()!.payment.status) }}</strong>
                @if (order()!.payment.transactionId) {
                  <br>Reference: <code>{{ order()!.payment.transactionId }}</code>
                }
                @if (order()!.payment.upiId) {
                  <br>UPI ID: <code>{{ order()!.payment.upiId }}</code>
                }
              </p>
              @if (order()!.status === 'pending_payment') {
                <a [routerLink]="['/payment', order()!._id]" class="btn btn-sm" style="margin-top: 0.75rem;">Complete payment</a>
              }
            </div>
          </aside>
        </div>
      }
    </section>
  `,
  styles: [`
    .back { font-size: 0.85rem; color: var(--muted); margin-bottom: 1rem; display: inline-block; }
    .head {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }
    .head h1 { margin: 0.4rem 0 0; font-size: 2rem; }
    .grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 3rem;
      align-items: start;
    }
    .items, .side > div {
      background: white;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
    }
    .items h3 { margin: 0 0 1.25rem; }
    .oitem {
      display: grid;
      grid-template-columns: 60px 1fr auto;
      gap: 1rem;
      align-items: center;
      padding: 0.85rem 0;
      border-bottom: 1px solid var(--line);
    }
    .oitem:last-of-type { border-bottom: none; }
    .oitem img { width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius); background: #f5f2ec; }
    .info { display: flex; flex-direction: column; gap: 0.1rem; }
    .small { font-size: 0.78rem; }
    .line-price { font-weight: 600; }
    .totals { padding-top: 1rem; margin-top: 0.5rem; border-top: 1px solid var(--line); }
    .row { display: flex; justify-content: space-between; padding: 0.4rem 0; }
    .row.total { font-size: 1.1rem; padding-top: 0.7rem; }
    .row.total strong { font-family: var(--serif); font-size: 1.4rem; }
    .side { display: flex; flex-direction: column; gap: 1.25rem; }
    .card-block h4 { margin: 0 0 0.75rem; font-size: 1rem; }
    .card-block p { margin: 0; line-height: 1.7; font-size: 0.95rem; }
    .card-block code { font-size: 0.82rem; }
    @media (max-width: 900px) {
      .grid { grid-template-columns: 1fr; }
    }
  `],
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private ordersService = inject(OrdersService);
  order = signal<Order | null>(null);
  loading = signal(true);
  fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80';

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== this.fallback) img.src = this.fallback;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.ordersService.get(id).subscribe({
      next: (o) => {
        this.order.set(o);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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

  statusClass(s: Order['status']): string {
    if (s === 'paid' || s === 'confirmed' || s === 'delivered' || s === 'shipped') return 'badge-success';
    if (s === 'failed' || s === 'cancelled') return 'badge-danger';
    if (s === 'pending' || s === 'pending_payment' || s === 'processing') return 'badge-warning';
    return '';
  }

  methodLabel(m: string): string {
    if (m === 'upi') return 'UPI';
    if (m === 'cod') return 'Cash on Delivery';
    return 'Not selected';
  }

  paymentStatusLabel(s: string): string {
    const map: Record<string, string> = {
      unpaid: 'Awaiting payment',
      success: 'Paid',
      pending: 'Pending (collect on delivery)',
      failure: 'Failed',
    };
    return map[s] || s;
  }
}
