import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/models';
import { ProductCardComponent } from '../../shared/components/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  template: `
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-copy">
          <span class="eyebrow">Est. 1972 · Geneva</span>
          <h1>Time, considered.</h1>
          <p>A curated atelier of mechanical pieces — from independent ateliers to heritage maisons. Each watch is selected, inspected, and presented as it deserves to be.</p>
          <div class="hero-actions">
            <a routerLink="/shop" class="btn btn-lg">Explore the atelier</a>
            <a routerLink="/shop" class="btn btn-lg btn-outline">Heritage collection</a>
          </div>
          <div class="hero-stats">
            <div><strong>120+</strong><span>references</span></div>
            <div><strong>14</strong><span>maisons</span></div>
            <div><strong>5 yr</strong><span>service warranty</span></div>
          </div>
        </div>
        <div class="hero-image">
          <img src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=80" alt="Featured timepiece">
          <div class="hero-quote">
            <span class="q">"</span>
            A watch is the only piece of jewelry a man wears that does something.
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="eyebrow">Featured</span>
            <h2>This week's atelier picks</h2>
          </div>
          <a routerLink="/shop" class="btn btn-ghost">View all →</a>
        </div>

        @if (loading()) {
          <p class="muted">Loading the atelier…</p>
        } @else {
          <div class="product-grid">
            @for (p of featured(); track p._id) {
              <app-product-card [product]="p"></app-product-card>
            }
          </div>
        }
      </div>
    </section>

    <section class="section pillars">
      <div class="container">
        <div class="pillars-grid">
          <div class="pillar">
            <span class="pillar-no">01</span>
            <h3>Curation, not catalogue</h3>
            <p>Every piece is hand-selected by our atelier team. We say no far more often than yes.</p>
          </div>
          <div class="pillar">
            <span class="pillar-no">02</span>
            <h3>Provenance, verified</h3>
            <p>Two horologists inspect each watch on arrival — movement, dial, and case authentication included.</p>
          </div>
          <div class="pillar">
            <span class="pillar-no">03</span>
            <h3>A five-year promise</h3>
            <p>All purchases include a five-year service warranty and complimentary annual regulation.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section cta">
      <div class="container cta-inner">
        <h2>Step inside the salon</h2>
        <p>Browse the full atelier, or speak with a concierge to find the piece that suits you.</p>
        <a routerLink="/shop" class="btn btn-lg">Enter the atelier</a>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      background: linear-gradient(180deg, #f5f2ec 0%, var(--bg) 100%);
      padding: 5rem 0 6rem;
    }
    .hero-inner {
      display: grid;
      grid-template-columns: 1.05fr 1fr;
      gap: 4rem;
      align-items: center;
    }
    .hero-copy h1 { margin-top: 0.5rem; }
    .hero-copy p {
      font-size: 1.1rem;
      color: var(--ink-soft);
      max-width: 480px;
      margin: 1.25rem 0 2rem;
    }
    .hero-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .hero-stats {
      display: flex;
      gap: 2.5rem;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid var(--line-strong);
    }
    .hero-stats > div { display: flex; flex-direction: column; }
    .hero-stats strong {
      font-family: var(--serif);
      font-size: 1.7rem;
      font-weight: 600;
    }
    .hero-stats span {
      font-size: 0.7rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--muted);
      margin-top: 4px;
    }
    .hero-image {
      position: relative;
      aspect-ratio: 4/5;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow);
    }
    .hero-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .hero-quote {
      position: absolute;
      bottom: 2rem;
      left: 2rem;
      right: 2rem;
      background: rgba(26, 26, 26, 0.9);
      color: var(--accent-soft);
      padding: 1.25rem 1.5rem;
      font-family: var(--serif);
      font-style: italic;
      font-size: 1rem;
      border-radius: var(--radius);
      backdrop-filter: blur(8px);
    }
    .q { font-size: 2rem; line-height: 0; vertical-align: -0.4em; color: var(--accent); }
    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: end;
      margin-bottom: 2.5rem;
    }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
    }
    .pillars { background: var(--ink); color: #d8d4cb; }
    .pillars h3 { color: white; }
    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 3rem;
    }
    .pillar { padding-top: 1.5rem; border-top: 1px solid #3a3a3a; }
    .pillar-no {
      font-family: var(--serif);
      font-size: 1.1rem;
      color: var(--accent);
      letter-spacing: 0.1em;
    }
    .pillar h3 { margin: 0.5rem 0 0.5rem; }
    .pillar p { color: #8a8a87; }
    .cta-inner { text-align: center; padding: 3rem 0; }
    .cta-inner p { color: var(--ink-soft); margin: 1rem 0 2rem; font-size: 1.05rem; }
    @media (max-width: 900px) {
      .hero-inner { grid-template-columns: 1fr; }
      .pillars-grid { grid-template-columns: 1fr; gap: 2rem; }
      .section-head { flex-direction: column; align-items: start; gap: 1rem; }
    }
  `],
})
export class HomeComponent implements OnInit {
  private products = inject(ProductsService);

  featured = signal<Product[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.products.list({ featured: true, limit: 6 }).subscribe({
      next: (res) => {
        this.featured.set(res.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
