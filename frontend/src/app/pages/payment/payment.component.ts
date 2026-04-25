import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrdersService } from '../../core/services/orders.service';
import { PaymentService } from '../../core/services/payment.service';
import { CartService } from '../../core/services/cart.service';
import { Order } from '../../core/models';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  template: `
    <section class="container section">
      <span class="eyebrow">Payment simulation</span>
      <h1>Complete your order</h1>
      <p class="muted lead">This is a simulated payment gateway. Choose an outcome to record against your order.</p>

      @if (loading()) {
        <p class="muted">Loading order…</p>
      } @else if (!order()) {
        <div class="empty-state"><h3>Order not found</h3></div>
      } @else if (result()) {
        <div class="result" [class.success]="result()!.status === 'success'"
             [class.failure]="result()!.status === 'failure'"
             [class.pending]="result()!.status === 'pending'">
          <div class="icon">
            @if (result()!.status === 'success') { ✓ }
            @else if (result()!.status === 'failure') { ✗ }
            @else { ⌛ }
          </div>
          <h2>
            @if (result()!.status === 'success') { Payment successful }
            @else if (result()!.status === 'failure') { Payment failed }
            @else { Payment pending }
          </h2>
          <p class="muted">Transaction reference</p>
          <code class="txn">{{ result()!.transactionId }}</code>
          <p class="amount">{{ result()!.amount | currency:'USD':'symbol':'1.2-2' }}</p>
          <div class="actions">
            <a routerLink="/orders" class="btn">View my orders</a>
            <a routerLink="/shop" class="btn btn-outline">Continue browsing</a>
          </div>
        </div>
      } @else {
        <div class="layout">
          <div class="options">
            <button class="option success" (click)="simulate('success')" [disabled]="paying()">
              <div class="opt-icon">✓</div>
              <div class="opt-body">
                <h3>Pay successfully</h3>
                <p>Mark this order as paid. Cart is cleared.</p>
              </div>
            </button>

            <button class="option failure" (click)="simulate('failure')" [disabled]="paying()">
              <div class="opt-icon">✗</div>
              <div class="opt-body">
                <h3>Simulate failure</h3>
                <p>Record a failed transaction. Order stays open.</p>
              </div>
            </button>

            <button class="option pending" (click)="simulate('pending')" [disabled]="paying()">
              <div class="opt-icon">⌛</div>
              <div class="opt-body">
                <h3>Mark as pending</h3>
                <p>Bank confirmation pending. Will be reviewed.</p>
              </div>
            </button>
          </div>

          <aside class="summary">
            <h3>Order #{{ order()!._id.slice(-6).toUpperCase() }}</h3>
            <div class="row"><span>Items</span><span>{{ order()!.items.length }}</span></div>
            <div class="row"><span>Subtotal</span><span>{{ order()!.subtotal | currency:'USD':'symbol':'1.2-2' }}</span></div>
            <div class="row"><span>Shipping</span><span>{{ order()!.shipping | currency:'USD':'symbol':'1.2-2' }}</span></div>
            <div class="row"><span>Tax</span><span>{{ order()!.tax | currency:'USD':'symbol':'1.2-2' }}</span></div>
            <div class="divider"></div>
            <div class="row total"><span>Total</span><strong>{{ order()!.total | currency:'USD':'symbol':'1.2-2' }}</strong></div>
            <p class="muted small ship-to">Shipping to: {{ order()!.shippingAddress.fullName }}, {{ order()!.shippingAddress.city }}</p>
          </aside>
        </div>
      }
    </section>
  `,
  styles: [`
    .lead { max-width: 580px; margin: 0.5rem 0 2.5rem; }
    .layout {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 3rem;
      align-items: start;
    }
    .options { display: flex; flex-direction: column; gap: 1rem; }
    .option {
      display: flex;
      gap: 1.25rem;
      align-items: center;
      padding: 1.5rem;
      background: white;
      border: 2px solid var(--line);
      border-radius: var(--radius-lg);
      text-align: left;
      width: 100%;
      cursor: pointer;
      transition: all 0.2s;
      color: var(--ink);
      text-transform: none;
      letter-spacing: 0;
    }
    .option:hover {
      border-color: var(--accent);
      transform: translateX(4px);
      background: white;
      color: var(--ink);
    }
    .opt-icon {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 1.5rem;
      font-weight: 600;
      flex-shrink: 0;
    }
    .option.success .opt-icon { background: rgba(47, 125, 79, 0.12); color: var(--success); }
    .option.failure .opt-icon { background: rgba(192, 57, 43, 0.12); color: var(--danger); }
    .option.pending .opt-icon { background: rgba(192, 138, 31, 0.12); color: var(--warning); }
    .opt-body h3 { margin: 0 0 0.2rem; font-size: 1.05rem; }
    .opt-body p { margin: 0; color: var(--muted); font-size: 0.9rem; }
    .summary {
      background: white;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      position: sticky;
      top: 90px;
    }
    .summary h3 { margin: 0 0 1rem; font-size: 1.05rem; }
    .row { display: flex; justify-content: space-between; padding: 0.4rem 0; }
    .row.total { font-size: 1.1rem; }
    .row.total strong { font-family: var(--serif); font-size: 1.4rem; }
    .ship-to { margin-top: 1rem; font-size: 0.78rem; }
    .small { font-size: 0.78rem; }
    .result {
      max-width: 560px;
      margin: 2rem auto;
      padding: 3rem 2rem;
      background: white;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      text-align: center;
    }
    .result .icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 2.5rem;
      font-weight: 600;
    }
    .result.success .icon { background: rgba(47, 125, 79, 0.12); color: var(--success); }
    .result.failure .icon { background: rgba(192, 57, 43, 0.12); color: var(--danger); }
    .result.pending .icon { background: rgba(192, 138, 31, 0.12); color: var(--warning); }
    .result h2 { margin: 0 0 1rem; }
    .txn {
      display: inline-block;
      background: #f5f2ec;
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius);
      font-size: 0.85rem;
      color: var(--ink);
      margin: 0.4rem 0;
    }
    .amount { font-family: var(--serif); font-size: 1.8rem; font-weight: 600; margin: 1rem 0 1.5rem; }
    .actions { display: flex; gap: 0.75rem; justify-content: center; }
    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
      .summary { position: static; }
    }
  `],
})
export class PaymentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orders = inject(OrdersService);
  private payments = inject(PaymentService);
  private cart = inject(CartService);
  private router = inject(Router);

  order = signal<Order | null>(null);
  loading = signal(true);
  paying = signal(false);
  result = signal<{ status: 'success' | 'failure' | 'pending'; transactionId: string; amount: number } | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('orderId');
    if (!id) return;
    this.orders.get(id).subscribe({
      next: (o) => {
        this.order.set(o);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  simulate(outcome: 'success' | 'failure' | 'pending'): void {
    const o = this.order();
    if (!o) return;
    this.paying.set(true);
    this.payments.simulate(o._id, outcome).subscribe({
      next: (res) => {
        this.result.set({
          status: res.payment.status,
          transactionId: res.payment.transactionId,
          amount: res.payment.amount,
        });
        if (outcome === 'success') this.cart.reset();
        this.paying.set(false);
      },
      error: (e) => {
        this.paying.set(false);
        alert(e?.error?.message || 'Payment simulation failed');
      },
    });
  }
}
