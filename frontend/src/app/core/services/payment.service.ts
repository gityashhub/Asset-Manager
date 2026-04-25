import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './api.config';
import { Order } from '../models';

export interface Payment {
  _id: string;
  transactionId: string;
  status: 'success' | 'failure' | 'pending';
  method: 'upi' | 'cod';
  amount: number;
  upiId?: string;
  createdAt: string;
}

export interface PaymentResponse {
  payment: Payment;
  order: Order;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);

  payByUpi(orderId: string, upiId: string): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${API_BASE}/payments/upi`, { orderId, upiId });
  }

  payByCod(orderId: string): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${API_BASE}/payments/cod`, { orderId });
  }
}
