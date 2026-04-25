import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './api.config';
import { Order, ShippingAddress } from '../models';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private http = inject(HttpClient);

  createFromCart(shippingAddress: ShippingAddress): Observable<Order> {
    return this.http.post<Order>(`${API_BASE}/orders`, { shippingAddress });
  }

  mine(): Observable<Order[]> {
    return this.http.get<Order[]>(`${API_BASE}/orders/mine`);
  }

  get(id: string): Observable<Order> {
    return this.http.get<Order>(`${API_BASE}/orders/${id}`);
  }

  listAll(): Observable<Order[]> {
    return this.http.get<Order[]>(`${API_BASE}/orders/all`);
  }

  updateStatus(id: string, status: Order['status']): Observable<Order> {
    return this.http.patch<Order>(`${API_BASE}/orders/${id}/status`, { status });
  }
}
