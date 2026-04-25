import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrdersService } from '../../core/services/orders.service';
import { PaymentService, Payment } from '../../core/services/payment.service';
import { CartService } from '../../core/services/cart.service';
import { Order } from '../../core/models';

type Step = 'choose' | 'upi' | 'cod' | 'processing' | 'done';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, RouterLink],
  template: `
    <section class="container section">
      <span class="eyebrow">Secure checkout</span>
      <h1>Complete your payment</h1>
      <p class="muted lead">
        Pay instantly with UPI or choose Cash on Delivery. All transactions are simulated for this demo.
      </p>

      @if (loading()) {
        <p class="muted">Loading order…</p>
      } @else if (!order()) {
        <div class="empty-state"><h3>Order not found</h3></div>
      } @else {
        <div class="layout">
          <div class="main-col">

            @if (step() === 'choose') {
              <div class="card">
                <h3 class="card-title">Choose a payment method</h3>

                <button class="method" (click)="chooseMethod('upi')">
                  <div class="method-icon upi-icon">
                    <span>UPI</span>
                  </div>
                  <div class="method-body">
                    <strong>UPI / QR</strong>
                    <span class="muted">Pay instantly using any UPI app — Google Pay, PhonePe, Paytm, BHIM</span>
                  </div>
                  <div class="method-arrow">›</div>
                </button>

                <button class="method" (click)="chooseMethod('cod')">
                  <div class="method-icon cod-icon">₹</div>
                  <div class="method-body">
                    <strong>Cash on Delivery</strong>
                    <span class="muted">Pay in cash when your order arrives at your doorstep</span>
                  </div>
                  <div class="method-arrow">›</div>
                </button>

                <p class="trust muted small">
                  <span class="lock">🔒</span>
                  Your information is protected by 256-bit encryption.
                </p>
              </div>
            }

            @if (step() === 'upi') {
              <div class="card upi-card">
                <button class="back" (click)="back()" type="button">‹ Back</button>
                <h3 class="card-title">Pay with UPI</h3>

                <div class="upi-grid">
                  <div class="qr-block">
                    <div class="qr">
                      <div class="qr-pattern" [innerHTML]="qrPattern()"></div>
                      <div class="qr-logo">UPI</div>
                    </div>
                    <p class="muted small center">Scan with any UPI app</p>
                  </div>

                  <div class="upi-form">
                    <div class="upi-apps">
                      <div class="app gpay">GPay</div>
                      <div class="app phonepe">PhonePe</div>
                      <div class="app paytm">Paytm</div>
                      <div class="app bhim">BHIM</div>
                    </div>

                    <div class="divider-or"><span>or enter UPI ID</span></div>

                    <div class="field">
                      <label>UPI ID</label>
                      <input
                        type="text"
                        [(ngModel)]="upiId"
                        name="upiId"
                        placeholder="yourname@okhdfc"
                        [class.error]="upiError()"
                        autocomplete="off">
                      @if (upiError()) {
                        <span class="error-text">{{ upiError() }}</span>
                      }
                    </div>

                    <button class="btn btn-lg btn-block" (click)="submitUpi()" [disabled]="submitting()">
                      {{ submitting() ? 'Processing…' : 'Pay ' + formatINR(order()!.total) }}
                    </button>

                    <p class="muted xsmall center">
                      You will receive a payment request on your UPI app.
                    </p>
                  </div>
                </div>
              </div>
            }

            @if (step() === 'cod') {
              <div class="card">
                <button class="back" (click)="back()" type="button">‹ Back</button>
                <h3 class="card-title">Confirm Cash on Delivery</h3>

                <div class="cod-info">
                  <div class="cod-row">
                    <span class="cod-label">Delivering to</span>
                    <span class="cod-value">
                      <strong>{{ order()!.shippingAddress.fullName }}</strong><br>
                      {{ order()!.shippingAddress.line1 }}, {{ order()!.shippingAddress.city }}<br>
                      {{ order()!.shippingAddress.state }} {{ order()!.shippingAddress.postalCode }}<br>
                      {{ order()!.shippingAddress.country }}
                      @if (order()!.shippingAddress.phone) {
                        <br>📞 {{ order()!.shippingAddress.phone }}
                      }
                    </span>
                  </div>

                  <div class="cod-row">
                    <span class="cod-label">Amount to pay on delivery</span>
                    <span class="cod-value amount">{{ formatINR(order()!.total) }}</span>
                  </div>

                  <div class="cod-notice">
                    <strong>Please note:</strong> Have the exact amount ready for the courier. Your order will be
                    dispatched within 24 hours and delivered in 3–5 business days.
                  </div>
                </div>

                <button class="btn btn-lg btn-block" (click)="submitCod()" [disabled]="submitting()">
                  {{ submitting() ? 'Placing order…' : 'Confirm Cash on Delivery' }}
                </button>
              </div>
            }

            @if (step() === 'processing') {
              <div class="card processing-card">
                <div class="spinner"></div>
                <h3>Processing your payment</h3>
                <p class="muted">Please wait while we confirm your transaction with your bank…</p>
                <p class="muted small">Do not refresh or close this page.</p>
              </div>
            }

            @if (step() === 'done' && result()) {
              <div class="card result"
                   [class.success]="result()!.status === 'success'"
                   [class.pending]="result()!.status === 'pending'"
                   [class.failure]="result()!.status === 'failure'">
                <div class="result-icon">
                  @if (result()!.status === 'success') { ✓ }
                  @else if (result()!.status === 'pending') { ⌛ }
                  @else { ✗ }
                </div>
                <h2>
                  @if (result()!.method === 'cod') { Order placed successfully }
                  @else if (result()!.status === 'success') { Payment successful }
                  @else if (result()!.status === 'pending') { Payment pending }
                  @else { Payment failed }
                </h2>
                <p class="muted result-msg">
                  @if (result()!.method === 'cod') {
                    Pay {{ formatINR(result()!.amount) }} in cash when your order arrives.
                  } @else {
                    {{ formatINR(result()!.amount) }} debited via UPI<span *ngIf="result()!.upiId"> from {{ result()!.upiId }}</span>.
                  }
                </p>

                <div class="receipt">
                  <div class="r-row"><span>Transaction ID</span><code>{{ result()!.transactionId }}</code></div>
                  <div class="r-row"><span>Order ID</span><code>#{{ order()!._id.slice(-8).toUpperCase() }}</code></div>
                  <div class="r-row"><span>Method</span><span>{{ result()!.method === 'upi' ? 'UPI' : 'Cash on Delivery' }}</span></div>
                  <div class="r-row"><span>Amount</span><strong>{{ formatINR(result()!.amount) }}</strong></div>
                  <div class="r-row"><span>Date &amp; time</span><span>{{ now }}</span></div>
                </div>

                <div class="actions">
                  <a routerLink="/orders" class="btn">View my orders</a>
                  <a routerLink="/shop" class="btn btn-outline">Continue shopping</a>
                </div>
              </div>
            }

          </div>

          <aside class="summary">
            <h3>Order summary</h3>
            <p class="muted small">Order #{{ order()!._id.slice(-8).toUpperCase() }}</p>
            <div class="divider"></div>
            <div class="row"><span>Items ({{ order()!.items.length }})</span><span>{{ formatINR(order()!.subtotal) }}</span></div>
            <div class="row"><span>Shipping</span><span>{{ formatINR(order()!.shipping) }}</span></div>
            <div class="row"><span>Tax</span><span>{{ formatINR(order()!.tax) }}</span></div>
            <div class="divider"></div>
            <div class="row total"><span>Total</span><strong>{{ formatINR(order()!.total) }}</strong></div>
            <p class="muted small ship-to">
              Ship to: {{ order()!.shippingAddress.fullName }}<br>
              {{ order()!.shippingAddress.city }}, {{ order()!.shippingAddress.country }}
            </p>
          </aside>
        </div>
      }
    </section>
  `,
  styles: [`
    .lead { max-width: 580px; margin: 0.5rem 0 2.5rem; }
    .layout { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2.5rem; align-items: start; }
    .main-col { display: flex; flex-direction: column; gap: 1.5rem; }
    .card {
      background: white;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      padding: 2rem;
      position: relative;
    }
    .card-title { margin: 0 0 1.5rem; font-size: 1.2rem; }
    .back {
      background: transparent; border: none; color: var(--muted);
      cursor: pointer; padding: 0; margin-bottom: 0.75rem;
      font-size: 0.9rem; letter-spacing: 0;
      text-transform: none;
    }
    .back:hover { color: var(--ink); }

    .method {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      width: 100%;
      padding: 1.25rem 1.5rem;
      background: white;
      border: 1.5px solid var(--line);
      border-radius: var(--radius);
      cursor: pointer;
      text-align: left;
      margin-bottom: 0.75rem;
      transition: all 0.18s ease;
      color: var(--ink);
      text-transform: none;
      letter-spacing: 0;
    }
    .method:hover { border-color: var(--accent); background: white; transform: translateX(2px); }
    .method:last-of-type { margin-bottom: 1rem; }
    .method-icon {
      width: 56px; height: 56px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1.05rem;
      flex-shrink: 0;
      letter-spacing: 0.5px;
    }
    .upi-icon { background: linear-gradient(135deg, #097969, #00a884); color: white; }
    .cod-icon { background: linear-gradient(135deg, #b8860b, #daa520); color: white; font-size: 1.6rem; }
    .method-body { display: flex; flex-direction: column; gap: 0.2rem; flex: 1; }
    .method-body strong { font-size: 1.02rem; color: var(--ink); }
    .method-body .muted { font-size: 0.85rem; }
    .method-arrow { font-size: 1.6rem; color: var(--muted); line-height: 1; }
    .trust { text-align: center; margin: 0.5rem 0 0; }
    .lock { margin-right: 0.3rem; }

    .upi-grid { display: grid; grid-template-columns: 220px 1fr; gap: 2rem; align-items: start; }
    .qr-block { display: flex; flex-direction: column; gap: 0.5rem; }
    .qr {
      width: 220px; height: 220px;
      background: white; padding: 12px;
      border: 2px solid var(--ink); border-radius: 12px;
      position: relative;
      display: flex; align-items: center; justify-content: center;
    }
    .qr-pattern {
      width: 100%; height: 100%;
      display: grid;
      grid-template-columns: repeat(21, 1fr);
      grid-template-rows: repeat(21, 1fr);
      gap: 0;
    }
    .qr-pattern .b { background: var(--ink); }
    .qr-logo {
      position: absolute;
      background: white; padding: 6px 10px;
      border-radius: 6px; border: 2px solid var(--ink);
      font-weight: 800; font-size: 0.75rem;
      color: var(--ink); letter-spacing: 0.5px;
    }
    .center { text-align: center; }
    .upi-apps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 0.5rem; }
    .app {
      padding: 0.7rem 0.4rem; text-align: center; font-weight: 600; font-size: 0.78rem;
      border-radius: 8px; color: white; letter-spacing: 0.3px;
    }
    .app.gpay { background: linear-gradient(135deg, #4285f4, #1a73e8); }
    .app.phonepe { background: linear-gradient(135deg, #5f259f, #3a1660); }
    .app.paytm { background: linear-gradient(135deg, #00baf2, #002970); }
    .app.bhim { background: linear-gradient(135deg, #f7941d, #ed2024); }
    .divider-or {
      text-align: center; position: relative; margin: 1rem 0; color: var(--muted); font-size: 0.78rem;
    }
    .divider-or::before, .divider-or::after {
      content: ''; position: absolute; top: 50%; width: 35%; height: 1px; background: var(--line);
    }
    .divider-or::before { left: 0; }
    .divider-or::after { right: 0; }
    .divider-or span { background: white; padding: 0 0.75rem; }
    .field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
    .field label { font-size: 0.8rem; font-weight: 600; color: var(--muted); letter-spacing: 0.05em; }
    .field input {
      padding: 0.85rem 1rem;
      border: 1.5px solid var(--line);
      border-radius: var(--radius);
      font-size: 0.95rem;
      font-family: inherit;
      transition: border-color 0.15s;
    }
    .field input:focus { outline: none; border-color: var(--accent); }
    .field input.error { border-color: var(--danger); }
    .error-text { color: var(--danger); font-size: 0.78rem; }
    .btn-block { width: 100%; }
    .xsmall { font-size: 0.72rem; margin-top: 0.5rem; }

    .cod-info { margin-bottom: 1.5rem; }
    .cod-row { display: flex; justify-content: space-between; gap: 1rem; padding: 0.85rem 0; border-bottom: 1px solid var(--line); }
    .cod-row:last-of-type { border-bottom: none; }
    .cod-label { color: var(--muted); font-size: 0.85rem; flex-shrink: 0; }
    .cod-value { text-align: right; line-height: 1.5; }
    .cod-value.amount { font-family: var(--serif); font-size: 1.4rem; font-weight: 600; }
    .cod-notice {
      background: #faf6ee; border: 1px solid #e8dcc1;
      border-radius: var(--radius); padding: 1rem;
      font-size: 0.85rem; color: var(--ink); margin-top: 1rem;
    }

    .processing-card { text-align: center; padding: 3rem 2rem; }
    .processing-card h3 { margin: 1.5rem 0 0.5rem; }
    .spinner {
      width: 56px; height: 56px; border-radius: 50%;
      border: 4px solid #e8e0d0; border-top-color: var(--accent);
      margin: 0 auto;
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .result { text-align: center; padding: 2.5rem 2rem; }
    .result-icon {
      width: 80px; height: 80px; margin: 0 auto 1.25rem;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%; font-size: 2.5rem; font-weight: 600;
    }
    .result.success .result-icon { background: rgba(47, 125, 79, 0.12); color: var(--success); }
    .result.pending .result-icon { background: rgba(192, 138, 31, 0.12); color: var(--warning); }
    .result.failure .result-icon { background: rgba(192, 57, 43, 0.12); color: var(--danger); }
    .result h2 { margin: 0 0 0.6rem; }
    .result-msg { max-width: 420px; margin: 0 auto 1.5rem; }
    .receipt {
      background: #faf6ee; border-radius: var(--radius);
      padding: 1.25rem 1.5rem; max-width: 460px; margin: 0 auto 1.5rem;
      text-align: left;
    }
    .r-row { display: flex; justify-content: space-between; gap: 1rem; padding: 0.45rem 0; font-size: 0.9rem; }
    .r-row code { font-family: 'SF Mono', 'Consolas', monospace; font-size: 0.82rem; background: white; padding: 0.15rem 0.5rem; border-radius: 4px; }
    .actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }

    .summary {
      background: white;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      position: sticky; top: 90px;
    }
    .summary h3 { margin: 0 0 0.4rem; font-size: 1.05rem; }
    .row { display: flex; justify-content: space-between; padding: 0.4rem 0; }
    .row.total { font-size: 1.1rem; }
    .row.total strong { font-family: var(--serif); font-size: 1.4rem; }
    .ship-to { margin-top: 1rem; font-size: 0.78rem; line-height: 1.5; }
    .small { font-size: 0.8rem; }

    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
      .summary { position: static; }
      .upi-grid { grid-template-columns: 1fr; }
      .qr { margin: 0 auto; }
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
  submitting = signal(false);
  step = signal<Step>('choose');
  result = signal<Payment | null>(null);
  upiError = signal('');
  upiId = '';
  now = new Date().toLocaleString();

  qrPattern = computed(() => this.generateQrPattern());

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('orderId');
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.orders.get(id).subscribe({
      next: (o) => {
        this.order.set(o);
        this.loading.set(false);
        if (o.payment?.status === 'success' || o.status === 'paid' || o.status === 'confirmed') {
          this.router.navigate(['/orders', o._id]);
        }
      },
      error: () => this.loading.set(false),
    });
  }

  chooseMethod(method: 'upi' | 'cod'): void {
    this.step.set(method);
  }

  back(): void {
    this.step.set('choose');
    this.upiError.set('');
  }

  submitUpi(): void {
    const o = this.order();
    if (!o) return;
    const id = this.upiId.trim();
    if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(id)) {
      this.upiError.set('Enter a valid UPI ID (e.g. yourname@okhdfc)');
      return;
    }
    this.upiError.set('');
    this.submitting.set(true);
    this.step.set('processing');

    setTimeout(() => {
      this.payments.payByUpi(o._id, id).subscribe({
        next: (res) => {
          this.now = new Date().toLocaleString();
          this.result.set(res.payment);
          this.step.set('done');
          this.submitting.set(false);
          this.cart.reset();
        },
        error: (e) => {
          this.submitting.set(false);
          this.step.set('upi');
          this.upiError.set(e?.error?.message || 'Payment failed. Please try again.');
        },
      });
    }, 1800);
  }

  submitCod(): void {
    const o = this.order();
    if (!o) return;
    this.submitting.set(true);
    this.step.set('processing');

    setTimeout(() => {
      this.payments.payByCod(o._id).subscribe({
        next: (res) => {
          this.now = new Date().toLocaleString();
          this.result.set(res.payment);
          this.step.set('done');
          this.submitting.set(false);
          this.cart.reset();
        },
        error: (e) => {
          this.submitting.set(false);
          this.step.set('cod');
          alert(e?.error?.message || 'Could not place COD order');
        },
      });
    }, 900);
  }

  formatINR(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  // Deterministic decorative QR-like grid (not a real scannable code).
  private generateQrPattern(): string {
    const size = 21;
    const cells: string[] = [];
    let seed = 1337;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    const isFinder = (r: number, c: number) => {
      const inBox = (br: number, bc: number) => r >= br && r < br + 7 && c >= bc && c < bc + 7;
      return inBox(0, 0) || inBox(0, 14) || inBox(14, 0);
    };
    const isFinderInner = (r: number, c: number) => {
      const ring = (br: number, bc: number) => {
        if (r < br || r > br + 6 || c < bc || c > bc + 6) return false;
        const onEdge = r === br || r === br + 6 || c === bc || c === bc + 6;
        const onInner = r >= br + 2 && r <= br + 4 && c >= bc + 2 && c <= bc + 4;
        return onEdge || onInner;
      };
      return ring(0, 0) || ring(0, 14) || ring(14, 0);
    };
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        let on = false;
        if (isFinder(r, c)) on = isFinderInner(r, c);
        else on = rand() > 0.55;
        cells.push(on ? '<div class="b"></div>' : '<div></div>');
      }
    }
    return cells.join('');
  }
}
