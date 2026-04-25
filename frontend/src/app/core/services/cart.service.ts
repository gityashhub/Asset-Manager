import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE } from './api.config';
import { Cart } from '../models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly cart = signal<Cart | null>(null);
  readonly itemCount = computed(() =>
    (this.cart()?.items || []).reduce((sum, i) => sum + i.quantity, 0)
  );
  readonly subtotal = computed(() =>
    (this.cart()?.items || []).reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0)
  );

  load(): Observable<Cart> {
    return this.http.get<Cart>(`${API_BASE}/cart`).pipe(tap((c) => this.cart.set(c)));
  }

  add(productId: string, quantity = 1): Observable<Cart> {
    return this.http
      .post<Cart>(`${API_BASE}/cart/items`, { productId, quantity })
      .pipe(tap((c) => this.cart.set(c)));
  }

  updateQty(productId: string, quantity: number): Observable<Cart> {
    return this.http
      .patch<Cart>(`${API_BASE}/cart/items/${productId}`, { quantity })
      .pipe(tap((c) => this.cart.set(c)));
  }

  remove(productId: string): Observable<Cart> {
    return this.http
      .delete<Cart>(`${API_BASE}/cart/items/${productId}`)
      .pipe(tap((c) => this.cart.set(c)));
  }

  clear(): Observable<Cart> {
    return this.http.delete<Cart>(`${API_BASE}/cart`).pipe(tap((c) => this.cart.set(c)));
  }

  reset(): void {
    this.cart.set(null);
  }

  refreshIfAuthed(): void {
    if (this.auth.isAuthenticated()) {
      this.load().subscribe({ error: () => {} });
    }
  }
}
