import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  template: `
    <section class="container section">
      <div class="cart-head">
        <span class="eyebrow">Your selection</span>
        <h1>Shopping cart</h1>
      </div>

      @if (!auth.isAuthenticated()) {
        <div class="empty-state">
          <h3>Sign in to view your cart</h3>
          <p>Your cart is saved across visits when you're signed in.</p>
          <a routerLink="/login" class="btn">Sign in</a>
        </div>
      } @else if (loading()) {
        <p class="muted">Loading your cart…</p>
      } @else if ((cart.cart()?.items?.length || 0) === 0) {
        <div class="empty-state">
          <h3>Your cart is empty</h3>
          <p>The atelier awaits.</p>
          <a routerLink="/shop" class="btn">Browse atelier</a>
        </div>
      } @else {
        <div class="cart-layout">
          <div class="items">
            @for (item of cart.cart()!.items; track item.product._id) {
              <article class="cart-item">
                <a [routerLink]="['/product', item.product._id]" class="thumb">
                  <img [src]="item.product.images?.[0] || fallback" [alt]="item.product.name">
                </a>
                <div class="info">
                  <span class="brand-line">{{ item.product.brand }}</span>
                  <a [routerLink]="['/product', item.product._id]"><h3>{{ item.product.name }}</h3></a>
                  <span class="muted small">{{ item.product.caseSize }} · {{ item.product.movement }}</span>
                </div>
                <div class="qty-control">
                  <button class="btn btn-outline btn-sm" (click)="updateQty(item.product._id, item.quantity - 1)">−</button>
                  <span>{{ item.quantity }}</span>
                  <button class="btn btn-outline btn-sm" (click)="updateQty(item.product._id, item.quantity + 1)">+</button>
                </div>
                <div class="line-price">{{ item.product.price * item.quantity | currency:'USD':'symbol':'1.0-0' }}</div>
                <button class="btn btn-ghost btn-sm remove" (click)="remove(item.product._id)">Remove</button>
              </article>
            }
          </div>

          <aside class="summary">
            <h3>Order summary</h3>
            <div class="row"><span>Subtotal</span><strong>{{ cart.subtotal() | currency:'USD':'symbol':'1.2-2' }}</strong></div>
            <div class="row"><span>Shipping</span><strong>{{ shipping() | currency:'USD':'symbol':'1.2-2' }}</strong></div>
            <div class="row"><span>Tax (8%)</span><strong>{{ tax() | currency:'USD':'symbol':'1.2-2' }}</strong></div>
            <div class="divider"></div>
            <div class="row total"><span>Total</span><strong>{{ total() | currency:'USD':'symbol':'1.2-2' }}</strong></div>
            <button class="btn btn-lg checkout-btn" (click)="checkout()">Proceed to checkout</button>
            <a routerLink="/shop" class="btn btn-ghost">Continue browsing</a>
          </aside>
        </div>
      }
    </section>
  `,
  styles: [`
    .cart-head { margin-bottom: 2.5rem; }
    .cart-layout {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: 3rem;
      align-items: start;
    }
    .items { display: flex; flex-direction: column; gap: 1rem; }
    .cart-item {
      display: grid;
      grid-template-columns: 100px 1fr auto auto auto;
      gap: 1.25rem;
      padding: 1.25rem;
      background: white;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      align-items: center;
    }
    .thumb {
      width: 100px;
      height: 100px;
      border-radius: var(--radius);
      overflow: hidden;
      background: linear-gradient(135deg, #f5f2ec, #ede8de);
    }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .info { display: flex; flex-direction: column; gap: 0.2rem; }
    .info h3 { margin: 0; font-size: 1.1rem; }
    .brand-line {
      font-size: 0.7rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--accent);
      font-weight: 600;
    }
    .small { font-size: 0.82rem; }
    .qty-control {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: 1px solid var(--line-strong);
      padding: 0.25rem;
      border-radius: var(--radius);
    }
    .qty-control span { min-width: 28px; text-align: center; font-weight: 600; }
    .line-price { font-weight: 600; font-size: 1.05rem; }
    .remove { color: var(--muted); }
    .summary {
      background: white;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      position: sticky;
      top: 90px;
    }
    .summary h3 { margin: 0 0 1.5rem; font-size: 1.2rem; }
    .row { display: flex; justify-content: space-between; padding: 0.5rem 0; }
    .row.total { font-size: 1.15rem; }
    .row.total strong { font-family: var(--serif); font-size: 1.5rem; }
    .checkout-btn { width: 100%; margin: 1rem 0 0.5rem; }
    @media (max-width: 900px) {
      .cart-layout { grid-template-columns: 1fr; }
      .cart-item { grid-template-columns: 80px 1fr; gap: 1rem; }
      .qty-control, .line-price, .remove { grid-column: span 2; }
    }
  `],
})
export class CartComponent implements OnInit {
  cart = inject(CartService);
  auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(true);
  fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';

  shipping = computed(() => (this.cart.subtotal() > 0 ? 25 : 0));
  tax = computed(() => +(this.cart.subtotal() * 0.08).toFixed(2));
  total = computed(() => this.cart.subtotal() + this.shipping() + this.tax());

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      this.loading.set(false);
      return;
    }
    this.cart.load().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  updateQty(productId: string, quantity: number): void {
    if (quantity < 0) return;
    this.cart.updateQty(productId, quantity).subscribe();
  }

  remove(productId: string): void {
    this.cart.remove(productId).subscribe();
  }

  checkout(): void {
    this.router.navigate(['/checkout']);
  }
}
