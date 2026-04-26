import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './api.config';

export interface ConciergeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ConciergePick {
  _id: string;
  name: string;
  brand: string;
  price: number;
}

export interface ConciergeResponse {
  reply: string;
  picks: ConciergePick[];
}

@Injectable({ providedIn: 'root' })
export class ConciergeService {
  private http = inject(HttpClient);

  ask(messages: ConciergeMessage[]): Observable<ConciergeResponse> {
    return this.http.post<ConciergeResponse>(`${API_BASE}/ai/concierge`, { messages });
  }
}
