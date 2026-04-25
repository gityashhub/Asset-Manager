import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';
import { AuthService } from '../../core/services/auth.service';
import { ShippingAddress } from '../../core/models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <section class="container section">
      <span class="eyebrow">Checkout</span>
      <h1>Where shall we send it?</h1>

      @if (loading()) {
        <p class="muted">Loading…</p>
      } @else if ((cart.cart()?.items?.length || 0) === 0) {
        <div class="empty-state">
          <h3>Your cart is empty</h3>
          <p>Add a piece before checking out.</p>
        </div>
      } @else {
        <div class="layout">
          <form class="form" (ngSubmit)="submit()" #f="ngForm">
            <h3>Shipping address</h3>

            <div class="field">
              <label>Full name</label>
              <input name="fullName" [(ngModel)]="address.fullName" required>
            </div>
            <div class="field">
              <label>Address</label>
              <input name="line1" [(ngModel)]="address.line1" required placeholder="Street, apt, etc.">
            </div>
            <div class="fields-row cols-2">
              <div class="field">
                <label>City</label>
                <input name="city" [(ngModel)]="address.city" required>
              </div>
              <div class="field">
                <label>State / Region</label>
                <input name="state" [(ngModel)]="address.state" required>
              </div>
            </div>
            <div class="fields-row cols-2">
              <div class="field">
                <label>Postal code</label>
                <input name="postalCode" [(ngModel)]="address.postalCode" required>
              </div>
              <div class="field">
                <label>Country</label>
                <input name="country" [(ngModel)]="address.country" required>
              </div>
            </div>
            <div class="field">
              <label>Phone (optional)</label>
              <input name="phone" [(ngModel)]="address.phone">
            </div>

            @if (error()) {
              <div class="alert alert-error">{{ error() }}</div>
            }

            <button class="btn btn-lg" type="submit" [disabled]="submitting() || f.invalid">
              {{ submitting() ? 'Placing order…' : 'Continue to payment' }}
            </button>
          </form>

          <aside class="summary">
            <h3>Order summary</h3>
            @for (item of cart.cart()!.items; track item.product._id) {
              <div class="line">
                <img [src]="item.product.images?.[0] || fallback" [alt]="item.product.name"
                     (error)="onImgError($event)">
                <div class="line-info">
                  <span class="muted small">{{ item.product.brand }}</span>
                  <strong>{{ item.product.name }}</strong>
                  <span class="muted small">Qty {{ item.quantity }}</span>
                </div>
                <span>{{ item.product.price * item.quantity | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
            }
            <div class="divider"></div>
            <div class="row"><span>Subtotal</span><span>{{ cart.subtotal() | currency:'USD':'symbol':'1.2-2' }}</span></div>
            <div class="row"><span>Shipping</span><span>{{ shipping() | currency:'USD':'symbol':'1.2-2' }}</span></div>
            <div class="row"><span>Tax</span><span>{{ tax() | currency:'USD':'symbol':'1.2-2' }}</span></div>
            <div class="row total"><span>Total</span><strong>{{ total() | currency:'USD':'symbol':'1.2-2' }}</strong></div>
          </aside>
        </div>
      }
    </section>
  `,
  styles: [`
    h1 { margin-bottom: 2.5rem; }
    .layout {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 3rem;
      align-items: start;
    }
    .form, .summary {
      background: white;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      padding: 2rem;
    }
    .form h3, .summary h3 { margin: 0 0 1.5rem; font-size: 1.2rem; }
    .summary { position: sticky; top: 90px; }
    .line {
      display: grid;
      grid-template-columns: 60px 1fr auto;
      gap: 1rem;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--line);
    }
    .line:last-of-type { border-bottom: none; }
    .line img {
      width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius);
      background: #f5f2ec;
    }
    .line-info { display: flex; flex-direction: column; gap: 0.1rem; }
    .small { font-size: 0.78rem; }
    .row { display: flex; justify-content: space-between; padding: 0.4rem 0; }
    .row.total { font-size: 1.15rem; padding-top: 0.75rem; }
    .row.total strong { font-family: var(--serif); font-size: 1.4rem; }
    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
      .summary { position: static; }
    }
  `],
})
export class CheckoutComponent implements OnInit {
  cart = inject(CartService);
  private orders = inject(OrdersService);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(true);
  submitting = signal(false);
  error = signal('');
  fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80';

  address: ShippingAddress = {
    fullName: '',
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  };

  shipping = computed(() => (this.cart.subtotal() > 0 ? 25 : 0));
  tax = computed(() => +(this.cart.subtotal() * 0.08).toFixed(2));
  total = computed(() => this.cart.subtotal() + this.shipping() + this.tax());

  ngOnInit(): void {
    const u = this.auth.user();
    if (u) this.address.fullName = u.name;
    this.cart.load().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  submit(): void {
    this.submitting.set(true);
    this.error.set('');
    this.orders.createFromCart(this.address).subscribe({
      next: (order) => {
        this.submitting.set(false);
        this.router.navigate(['/payment', order._id]);
      },
      error: (e) => {
        this.error.set(e?.error?.message || 'Could not place order');
        this.submitting.set(false);
      },
    });
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== this.fallback) img.src = this.fallback;
  }
}
