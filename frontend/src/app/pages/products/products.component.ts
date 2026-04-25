import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService, ProductQuery } from '../../core/services/products.service';
import { Product } from '../../core/models';
import { ProductCardComponent } from '../../shared/components/product-card.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  template: `
    <section class="page-hero">
      <div class="container">
        <span class="eyebrow">The atelier</span>
        <h1>Every watch we offer</h1>
        <p class="lead">Browse the full collection. Filter by maison, category, or movement to find a piece that suits.</p>
      </div>
    </section>

    <section class="section">
      <div class="container shop-grid">
        <aside class="filters">
          <div class="filter-block">
            <h4>Search</h4>
            <input
              type="search"
              [(ngModel)]="query.q"
              (ngModelChange)="onFilterChange()"
              placeholder="Search by name or brand…">
          </div>

          <div class="filter-block">
            <h4>Maison</h4>
            <select [(ngModel)]="query.brand" (ngModelChange)="onFilterChange()">
              <option [ngValue]="undefined">All maisons</option>
              @for (b of brands(); track b) {
                <option [ngValue]="b">{{ b }}</option>
              }
            </select>
          </div>

          <div class="filter-block">
            <h4>Category</h4>
            <select [(ngModel)]="query.category" (ngModelChange)="onFilterChange()">
              <option [ngValue]="undefined">All categories</option>
              @for (c of categories; track c) {
                <option [ngValue]="c">{{ c }}</option>
              }
            </select>
          </div>

          <div class="filter-block">
            <h4>Price</h4>
            <div class="price-range">
              <input type="number" [(ngModel)]="query.minPrice" (ngModelChange)="onFilterChange()" placeholder="Min">
              <input type="number" [(ngModel)]="query.maxPrice" (ngModelChange)="onFilterChange()" placeholder="Max">
            </div>
          </div>

          <button class="btn btn-outline btn-sm" (click)="reset()">Reset filters</button>
        </aside>

        <div class="results">
          <div class="results-head">
            <span class="muted">{{ total() }} results</span>
            <select [(ngModel)]="query.sort" (ngModelChange)="onFilterChange()" class="sort-select">
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="rating">Highest rated</option>
            </select>
          </div>

          @if (loading()) {
            <p class="muted">Loading…</p>
          } @else if (items().length === 0) {
            <div class="empty-state">
              <h3>Nothing matches</h3>
              <p>Try removing some filters.</p>
            </div>
          } @else {
            <div class="product-grid">
              @for (p of items(); track p._id) {
                <app-product-card [product]="p"></app-product-card>
              }
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page-hero {
      background: linear-gradient(180deg, #f5f2ec, var(--bg));
      padding: 4rem 0 3rem;
    }
    .lead { font-size: 1.1rem; color: var(--ink-soft); max-width: 620px; }
    .shop-grid {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 3rem;
      align-items: start;
    }
    .filters {
      position: sticky;
      top: 90px;
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      padding: 1.5rem;
      background: white;
      border-radius: var(--radius-lg);
      border: 1px solid var(--line);
    }
    .filter-block h4 {
      font-size: 0.7rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--muted);
      font-weight: 600;
      margin: 0 0 0.6rem;
      font-family: var(--sans);
    }
    .price-range {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
    .results-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .sort-select { width: auto; }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.5rem;
    }
    @media (max-width: 900px) {
      .shop-grid { grid-template-columns: 1fr; }
      .filters { position: static; }
    }
  `],
})
export class ProductsComponent implements OnInit {
  private productsService = inject(ProductsService);

  query: ProductQuery = { sort: 'newest' };
  items = signal<Product[]>([]);
  brands = signal<string[]>([]);
  total = signal(0);
  loading = signal(true);

  categories = ['Luxury', 'Sport', 'Classic', 'Smart', 'Diver', 'Dress', 'Pilot'];

  private debounce: any;

  ngOnInit(): void {
    this.fetch();
    this.productsService.brands().subscribe({ next: (b) => this.brands.set(b) });
  }

  onFilterChange(): void {
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => this.fetch(), 250);
  }

  reset(): void {
    this.query = { sort: 'newest' };
    this.fetch();
  }

  private fetch(): void {
    this.loading.set(true);
    this.productsService.list(this.query).subscribe({
      next: (res) => {
        this.items.set(res.items);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
