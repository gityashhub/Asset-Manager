import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <h4>Watch Hub</h4>
          <p>A curated destination for considered timepieces — paired with a personal AI concierge to help you choose well.</p>
        </div>
        <div class="footer-col">
          <h5>Shop</h5>
          <a routerLink="/shop">All watches</a>
          <a routerLink="/shop">New arrivals</a>
          <a routerLink="/shop">Heritage</a>
        </div>
        <div class="footer-col">
          <h5>Services</h5>
          <a>AI Concierge</a>
          <a>Servicing</a>
          <a>Trade-in</a>
        </div>
        <div class="footer-col">
          <h5>Hub</h5>
          <a>About</a>
          <a>Press</a>
          <a>Contact</a>
        </div>
      </div>
      <div class="container footer-bottom">
        <span>© {{ year }} Watch Hub. Time, well kept.</span>
        <span>Crafted with patience.</span>
      </div>
    </footer>
  `,
  styles: [`
    .site-footer {
      background: #111111;
      color: #d8d4cb;
      margin-top: clamp(3rem, 6vw, 5rem);
      padding: clamp(2.5rem, 5vw, 4rem) 0 1.75rem;
    }
    .footer-inner {
      display: grid;
      grid-template-columns: 1.6fr repeat(3, 1fr);
      gap: clamp(1.5rem, 3vw, 3rem);
      padding-bottom: clamp(1.5rem, 4vw, 2.5rem);
      border-bottom: 1px solid #2c2c2c;
    }
    .footer-brand h4 {
      font-family: var(--serif);
      font-size: clamp(1.4rem, 2vw, 1.7rem);
      color: white;
      margin: 0 0 0.55rem;
      letter-spacing: -0.01em;
    }
    .footer-brand p {
      color: #9a9a93;
      max-width: 340px;
      font-size: 0.92rem;
      line-height: 1.6;
      margin: 0;
    }
    .footer-col {
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
    }
    .footer-col h5 {
      font-size: 0.7rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--accent);
      margin: 0 0 0.35rem;
      font-weight: 700;
    }
    .footer-col a {
      color: #d8d4cb;
      font-size: 0.9rem;
      cursor: pointer;
      padding: 0.15rem 0;
    }
    .footer-col a:hover { color: white; }
    .footer-bottom {
      padding: 1.25rem 0 0;
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
      flex-wrap: wrap;
      font-size: 0.78rem;
      color: #6a6a67;
    }
    @media (max-width: 860px) {
      .footer-inner { grid-template-columns: 1fr 1fr; }
      .footer-brand { grid-column: 1 / -1; }
    }
    @media (max-width: 480px) {
      .footer-inner { grid-template-columns: 1fr; gap: 1.75rem; }
      .footer-bottom { flex-direction: column; align-items: flex-start; }
    }
  `],
})
export class FooterComponent {
  year = new Date().getFullYear();
}
