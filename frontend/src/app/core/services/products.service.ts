import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './api.config';
import { Product, ProductListResponse } from '../models';

export interface ProductQuery {
  q?: string;
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
  limit?: number;
  featured?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);

  list(query: ProductQuery = {}): Observable<ProductListResponse> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<ProductListResponse>(`${API_BASE}/products`, { params });
  }

  get(id: string): Observable<Product> {
    return this.http.get<Product>(`${API_BASE}/products/${id}`);
  }

  brands(): Observable<string[]> {
    return this.http.get<string[]>(`${API_BASE}/products/brands`);
  }

  create(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${API_BASE}/products`, data);
  }

  update(id: string, data: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${API_BASE}/products/${id}`, data);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_BASE}/products/${id}`);
  }
}
