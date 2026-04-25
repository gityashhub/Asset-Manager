import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  template: `
    <a [routerLink]="['/product', product._id]" class="product-card">
      <div class="image-wrap">
        @if (product.featured) { <span class="featured-tag">Featured</span> }
        @if (product.originalPrice && product.originalPrice > product.price) {
          <span class="sale-tag">Sale</span>
        }
        <img [src]="product.images?.[0] || fallback" [alt]="product.name" loading="lazy">
      </div>
      <div class="meta">
        <span class="brand">{{ product.brand }}</span>
        <h3>{{ product.name }}</h3>
        <div class="footer">
          <div class="price">
            @if (product.originalPrice && product.originalPrice > product.price) {
              <span class="strike">{{ product.originalPrice | currency:'USD':'symbol':'1.0-0' }}</span>
            }
            <span class="now">{{ product.price | currency:'USD':'symbol':'1.0-0' }}</span>
          </div>
          <span class="cat">{{ product.category }}</span>
        </div>
      </div>
    </a>
  `,
  styles: [`
    .product-card {
      display: flex;
      flex-direction: column;
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: all 0.3s;
      height: 100%;
    }
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow);
      border-color: var(--accent);
    }
    .image-wrap {
      position: relative;
      aspect-ratio: 1;
      background: linear-gradient(135deg, #f5f2ec, #ede8de);
      overflow: hidden;
    }
    .image-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s;
    }
    .product-card:hover .image-wrap img { transform: scale(1.05); }
    .featured-tag, .sale-tag {
      position: absolute;
      top: 1rem;
      padding: 0.3rem 0.7rem;
      font-size: 0.65rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-weight: 600;
      border-radius: 999px;
      z-index: 1;
    }
    .featured-tag { left: 1rem; background: white; color: var(--ink); }
    .sale-tag { right: 1rem; background: var(--accent-deep); color: white; }
    .meta {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      flex: 1;
    }
    .brand {
      font-size: 0.7rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--accent);
      font-weight: 600;
    }
    .meta h3 {
      font-size: 1.1rem;
      margin: 0;
      flex: 1;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-top: 0.4rem;
    }
    .price { display: flex; align-items: baseline; gap: 0.5rem; }
    .now { font-weight: 600; font-size: 1.05rem; }
    .strike { text-decoration: line-through; color: var(--muted); font-size: 0.85rem; }
    .cat {
      font-size: 0.72rem;
      color: var(--muted);
      letter-spacing: 0.06em;
    }
  `],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
}
