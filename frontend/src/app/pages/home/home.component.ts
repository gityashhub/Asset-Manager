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
          <span class="eyebrow">Curated since 1972</span>
          <h1>Time, <em>considered.</em></h1>
          <p>A handpicked hub of mechanical and modern watches — from independent ateliers to heritage maisons. Each piece is selected, inspected, and presented as it deserves to be.</p>
          <div class="hero-actions">
            <a routerLink="/shop" class="btn btn-lg">Explore the collection</a>
            <a routerLink="/shop" class="btn btn-lg btn-outline">Heritage picks</a>
          </div>
          <div class="hero-stats">
            <div><strong>120+</strong><span>references</span></div>
            <div><strong>14</strong><span>maisons</span></div>
            <div><strong>5 yr</strong><span>warranty</span></div>
            <div class="ai-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.4 7h7.6l-6.2 4.5 2.4 7L12 16l-6.2 4.5 2.4-7L2 9h7.6L12 2z"/></svg>
              AI Concierge inside
            </div>
          </div>
        </div>
        <div class="hero-image">
          <img src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1100&q=80" alt="Featured timepiece" loading="eager">
          <div class="hero-quote">
            <span class="q">&ldquo;</span>
            A watch is the only piece of jewelry a man wears that does something.
          </div>
        </div>
      </div>
    </section>

    <section class="section featured-section">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="eyebrow">Featured</span>
            <h2>This week's hub picks</h2>
          </div>
          <a routerLink="/shop" class="btn btn-ghost">View all <span aria-hidden="true">→</span></a>
        </div>

        @if (loading()) {
          <div class="skeleton-grid">
            <div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>
            <div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>
          </div>
        } @else if (featured().length === 0) {
          <p class="muted">No featured pieces just yet — check back soon.</p>
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
        <div class="pillars-head">
          <span class="eyebrow accent-on-dark">Why Watch Hub</span>
          <h2>A quiet promise behind every timepiece.</h2>
        </div>
        <div class="pillars-grid">
          <article class="pillar">
            <span class="pillar-no">01</span>
            <h3>Curation, not catalogue</h3>
            <p>Every piece is hand-selected by our hub team. We say no far more often than yes.</p>
          </article>
          <article class="pillar">
            <span class="pillar-no">02</span>
            <h3>Provenance, verified</h3>
            <p>Two horologists inspect each watch on arrival — movement, dial, and case authentication included.</p>
          </article>
          <article class="pillar">
            <span class="pillar-no">03</span>
            <h3>A five-year promise</h3>
            <p>All purchases include a five-year service warranty and complimentary annual regulation.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section cta">
      <div class="container cta-inner">
        <span class="eyebrow">Need a guide?</span>
        <h2>Speak with the AI Concierge.</h2>
        <p>Tell us your occasion, style, or budget — we'll suggest pieces from the live collection in seconds.</p>
        <a routerLink="/shop" class="btn btn-lg">Enter the hub</a>
      </div>
    </section>
  `,
  styles: [`
    /* ---------- HERO ---------- */
    .hero {
      background:
        radial-gradient(1200px 500px at 100% 0%, rgba(184, 136, 74, 0.10), transparent 60%),
        linear-gradient(180deg, #f5f2ec 0%, var(--bg) 100%);
      padding: clamp(2.5rem, 6vw, 5.5rem) 0 clamp(3rem, 7vw, 6rem);
      overflow: hidden;
    }
    .hero-inner {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: clamp(2rem, 5vw, 4rem);
      align-items: center;
    }
    .hero-copy h1 {
      margin: 0.25rem 0 0;
      font-weight: 500;
    }
    .hero-copy h1 em {
      font-style: italic;
      color: var(--accent-deep);
      font-weight: 500;
    }
    .hero-copy p {
      font-size: clamp(1rem, 0.6vw + 0.85rem, 1.15rem);
      color: var(--ink-soft);
      max-width: 52ch;
      margin: 1.25rem 0 2rem;
      line-height: 1.65;
    }
    .hero-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .hero-actions .btn { flex: 0 1 auto; }
    .hero-stats {
      display: flex;
      gap: clamp(1.25rem, 3vw, 2.5rem);
      margin-top: clamp(2rem, 4vw, 3rem);
      padding-top: clamp(1.5rem, 3vw, 2rem);
      border-top: 1px solid var(--line-strong);
      flex-wrap: wrap;
      align-items: center;
    }
    .hero-stats > div { display: flex; flex-direction: column; }
    .hero-stats strong {
      font-family: var(--serif);
      font-size: clamp(1.4rem, 2vw, 1.8rem);
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .hero-stats span {
      font-size: 0.68rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--muted);
      margin-top: 4px;
      font-weight: 600;
    }
    .ai-pill {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: var(--ink); color: var(--accent);
      padding: 0.55rem 0.95rem; border-radius: 999px;
      font-size: 0.72rem; letter-spacing: 0.14em;
      text-transform: uppercase; font-weight: 700;
      margin-left: auto;
    }

    /* ---------- HERO IMAGE ---------- */
    .hero-image {
      position: relative;
      aspect-ratio: 4/5;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow);
    }
    .hero-image img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.8s ease;
    }
    .hero-image:hover img { transform: scale(1.03); }
    .hero-quote {
      position: absolute;
      bottom: clamp(1rem, 2vw, 2rem);
      left: clamp(1rem, 2vw, 2rem);
      right: clamp(1rem, 2vw, 2rem);
      background: rgba(17, 17, 17, 0.88);
      color: var(--accent-soft);
      padding: 1rem 1.25rem;
      font-family: var(--serif);
      font-style: italic;
      font-size: clamp(0.88rem, 1vw + 0.5rem, 1rem);
      line-height: 1.4;
      border-radius: var(--radius);
      backdrop-filter: blur(8px);
    }
    .q { font-size: 1.8em; line-height: 0; vertical-align: -0.35em; color: var(--accent); margin-right: 0.15em; }

    /* ---------- SECTIONS ---------- */
    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 1rem;
      margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
      flex-wrap: wrap;
    }
    .section-head h2 { margin: 0; }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
      gap: clamp(1rem, 2vw, 1.5rem);
    }
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
      gap: clamp(1rem, 2vw, 1.5rem);
    }
    .skeleton {
      aspect-ratio: 1 / 1.25;
      border-radius: var(--radius-lg);
      background: linear-gradient(110deg, #ece8df 8%, #f6f2e9 18%, #ece8df 33%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite linear;
    }
    @keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }

    /* ---------- PILLARS ---------- */
    .pillars { background: var(--ink); color: #d8d4cb; }
    .pillars h2, .pillars h3 { color: white; }
    .pillars-head { max-width: 580px; margin-bottom: clamp(1.5rem, 3vw, 2.5rem); }
    .accent-on-dark { color: var(--accent) !important; }
    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: clamp(1.5rem, 3vw, 3rem);
    }
    .pillar { padding-top: 1.25rem; border-top: 1px solid #3a3a3a; }
    .pillar-no {
      font-family: var(--serif);
      font-size: 1.05rem;
      color: var(--accent);
      letter-spacing: 0.15em;
      font-weight: 600;
    }
    .pillar h3 { margin: 0.7rem 0 0.6rem; font-size: clamp(1.15rem, 1.4vw, 1.35rem); }
    .pillar p { color: #9a9a92; font-size: 0.95rem; margin: 0; line-height: 1.6; }

    /* ---------- CTA ---------- */
    .cta { background: linear-gradient(180deg, var(--bg) 0%, #f5f2ec 100%); }
    .cta-inner { text-align: center; max-width: 640px; margin: 0 auto; padding: clamp(1rem, 3vw, 2.5rem) 0; }
    .cta-inner h2 { margin: 0.4rem 0 0.8rem; }
    .cta-inner p { color: var(--ink-soft); margin: 0 0 2rem; font-size: 1.02rem; }

    /* ---------- RESPONSIVE ---------- */
    @media (max-width: 900px) {
      .hero-inner { grid-template-columns: 1fr; }
      .hero-image { aspect-ratio: 16/11; max-height: 460px; order: -1; }
      .pillars-grid { grid-template-columns: 1fr; gap: 1.5rem; }
      .ai-pill { margin-left: 0; }
    }
    @media (max-width: 540px) {
      .hero-actions { flex-direction: column; align-items: stretch; }
      .hero-actions .btn { width: 100%; }
      .hero-stats { gap: 1.5rem 1.75rem; }
      .hero-image { aspect-ratio: 4/3; }
      .hero-quote { display: none; }
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
