import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './api.config';
import { Order } from '../models';

export interface SimulatePaymentResponse {
  payment: {
    _id: string;
    transactionId: string;
    status: 'success' | 'failure' | 'pending';
    amount: number;
  };
  order: Order;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);

  simulate(orderId: string, outcome: 'success' | 'failure' | 'pending'): Observable<SimulatePaymentResponse> {
    return this.http.post<SimulatePaymentResponse>(`${API_BASE}/payments/simulate`, { orderId, outcome });
  }
}
