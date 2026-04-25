import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../core/services/products.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  template: `
    @if (loading()) {
      <div class="container section"><p class="muted">Loading…</p></div>
    } @else if (!product()) {
      <div class="container section empty-state">
        <h3>We could not find this piece</h3>
        <a routerLink="/shop" class="btn">Back to atelier</a>
      </div>
    } @else {
      <section class="container product-page">
        <nav class="crumbs">
          <a routerLink="/">Home</a> · <a routerLink="/shop">Atelier</a> · <span>{{ product()!.brand }}</span>
        </nav>

        <div class="product-grid">
          <div class="gallery">
            <div class="main-image">
              <img [src]="activeImage() || fallback" [alt]="product()!.name"
                   (error)="onImgError($event)">
            </div>
            @if ((product()!.images?.length || 0) > 1) {
              <div class="thumbs">
                @for (img of product()!.images; track img) {
                  <button
                    class="thumb"
                    [class.active]="img === activeImage()"
                    (click)="activeImage.set(img)">
                    <img [src]="img" [alt]="''" (error)="onImgError($event)">
                  </button>
                }
              </div>
            }
          </div>

          <div class="details">
            <span class="eyebrow">{{ product()!.brand }}</span>
            <h1>{{ product()!.name }}</h1>
            <div class="rating">
              <span class="stars">{{ stars(product()!.rating) }}</span>
              <span class="muted">{{ product()!.rating.toFixed(1) }} · {{ product()!.reviewCount }} reviews</span>
            </div>

            <div class="price-row">
              @if (product()!.originalPrice && product()!.originalPrice! > product()!.price) {
                <span class="strike">{{ product()!.originalPrice | currency:'USD':'symbol':'1.0-0' }}</span>
              }
              <span class="price">{{ product()!.price | currency:'USD':'symbol':'1.0-0' }}</span>
              @if (product()!.stock <= 5 && product()!.stock > 0) {
                <span class="badge badge-warning">Only {{ product()!.stock }} left</span>
              } @else if (product()!.stock === 0) {
                <span class="badge badge-danger">Sold out</span>
              } @else {
                <span class="badge badge-success">In stock</span>
              }
            </div>

            <p class="description">{{ product()!.description }}</p>

            <dl class="specs">
              <div><dt>Movement</dt><dd>{{ product()!.movement }}</dd></div>
              <div><dt>Case material</dt><dd>{{ product()!.caseMaterial }}</dd></div>
              <div><dt>Case size</dt><dd>{{ product()!.caseSize }}</dd></div>
              <div><dt>Water resistance</dt><dd>{{ product()!.waterResistance }}</dd></div>
              <div><dt>Category</dt><dd>{{ product()!.category }}</dd></div>
            </dl>

            <div class="actions">
              <div class="qty">
                <button class="btn btn-outline btn-sm" (click)="dec()" [disabled]="qty() <= 1">−</button>
                <span>{{ qty() }}</span>
                <button class="btn btn-outline btn-sm" (click)="inc()" [disabled]="qty() >= product()!.stock">+</button>
              </div>
              <button class="btn btn-lg" (click)="addToCart()" [disabled]="adding() || product()!.stock === 0">
                {{ adding() ? 'Adding…' : 'Add to cart' }}
              </button>
            </div>

            @if (message()) {
              <div class="alert" [class.alert-success]="messageType() === 'success'" [class.alert-error]="messageType() === 'error'">
                {{ message() }}
              </div>
            }

            <div class="reassurance">
              <div>
                <strong>Authenticated</strong>
                <span>Two-horologist inspection</span>
              </div>
              <div>
                <strong>5-year warranty</strong>
                <span>Service & regulation included</span>
              </div>
              <div>
                <strong>Insured shipping</strong>
                <span>Worldwide, signature required</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    }
  `,
  styles: [`
    .product-page { padding: 2rem 1.5rem 4rem; }
    .crumbs {
      font-size: 0.82rem;
      color: var(--muted);
      margin-bottom: 2rem;
    }
    .crumbs a:hover { color: var(--accent); }
    .product-grid {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 4rem;
    }
    .gallery { display: flex; flex-direction: column; gap: 1rem; }
    .main-image {
      aspect-ratio: 1;
      background: linear-gradient(135deg, #f5f2ec, #ede8de);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .main-image img { width: 100%; height: 100%; object-fit: cover; }
    .thumbs { display: flex; gap: 0.5rem; }
    .thumb {
      width: 70px;
      height: 70px;
      padding: 0;
      border: 1px solid var(--line);
      background: white;
      border-radius: var(--radius);
      overflow: hidden;
    }
    .thumb.active { border-color: var(--accent); border-width: 2px; }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .details h1 { margin: 0.5rem 0 0.5rem; }
    .rating { display: flex; gap: 0.6rem; align-items: center; margin-bottom: 1.5rem; }
    .stars { color: var(--accent); font-size: 1rem; }
    .price-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .price { font-family: var(--serif); font-size: 2rem; font-weight: 600; }
    .strike { text-decoration: line-through; color: var(--muted); }
    .description {
      font-size: 1.02rem;
      color: var(--ink-soft);
      line-height: 1.7;
      margin: 0 0 2rem;
    }
    .specs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem 1.5rem;
      margin: 0 0 2rem;
      padding: 1.5rem;
      background: white;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
    }
    .specs > div { display: flex; flex-direction: column; }
    .specs dt {
      font-size: 0.7rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--muted);
      font-weight: 600;
    }
    .specs dd {
      margin: 0.2rem 0 0;
      font-size: 0.95rem;
      font-weight: 500;
    }
    .actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      align-items: center;
    }
    .qty {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: 1px solid var(--line-strong);
      border-radius: var(--radius);
      padding: 0.25rem;
    }
    .qty span {
      min-width: 28px;
      text-align: center;
      font-weight: 600;
    }
    .reassurance {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-top: 2.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--line);
    }
    .reassurance > div { display: flex; flex-direction: column; }
    .reassurance strong { font-size: 0.85rem; }
    .reassurance span { font-size: 0.75rem; color: var(--muted); }
    @media (max-width: 900px) {
      .product-grid { grid-template-columns: 1fr; gap: 2rem; }
    }
  `],
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private products = inject(ProductsService);
  private cart = inject(CartService);
  private auth = inject(AuthService);

  product = signal<Product | null>(null);
  activeImage = signal<string | null>(null);
  loading = signal(true);
  qty = signal(1);
  adding = signal(false);
  message = signal('');
  messageType = signal<'success' | 'error' | ''>('');
  fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80';

  ngOnInit(): void {
    this.route.paramMap.subscribe((p) => {
      const id = p.get('id');
      if (!id) return;
      this.loading.set(true);
      this.products.get(id).subscribe({
        next: (prod) => {
          this.product.set(prod);
          this.activeImage.set(prod.images?.[0] || null);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    });
  }

  inc(): void {
    const p = this.product();
    if (!p) return;
    if (this.qty() < p.stock) this.qty.update((v) => v + 1);
  }
  dec(): void {
    if (this.qty() > 1) this.qty.update((v) => v - 1);
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { redirect: `/product/${p._id}` } });
      return;
    }
    this.adding.set(true);
    this.cart.add(p._id, this.qty()).subscribe({
      next: () => {
        this.message.set('Added to your cart.');
        this.messageType.set('success');
        this.adding.set(false);
        setTimeout(() => this.message.set(''), 3000);
      },
      error: (e) => {
        this.message.set(e?.error?.message || 'Could not add to cart');
        this.messageType.set('error');
        this.adding.set(false);
      },
    });
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== this.fallback) img.src = this.fallback;
  }

  stars(rating: number): string {
    const full = Math.round(rating);
    return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
  }
}
