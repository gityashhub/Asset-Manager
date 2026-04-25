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
          <h4>Maison Tempus</h4>
          <p>A curated atelier of considered timepieces, served with the calm of a private salon.</p>
        </div>
        <div class="footer-col">
          <h5>Atelier</h5>
          <a routerLink="/shop">All watches</a>
          <a routerLink="/shop">New arrivals</a>
          <a routerLink="/shop">Heritage</a>
        </div>
        <div class="footer-col">
          <h5>Services</h5>
          <a>Concierge</a>
          <a>Servicing</a>
          <a>Trade-in</a>
        </div>
        <div class="footer-col">
          <h5>Maison</h5>
          <a>About</a>
          <a>Press</a>
          <a>Contact</a>
        </div>
      </div>
      <div class="container footer-bottom">
        <span>© {{ year }} Maison Tempus. All times are local.</span>
        <span>Crafted with patience.</span>
      </div>
    </footer>
  `,
  styles: [`
    .site-footer {
      background: #1a1a1a;
      color: #d8d4cb;
      margin-top: 5rem;
      padding: 4rem 0 2rem;
    }
    .footer-inner {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
      gap: 3rem;
      padding-bottom: 3rem;
      border-bottom: 1px solid #2c2c2c;
    }
    .footer-brand h4 {
      font-family: var(--serif);
      font-size: 1.6rem;
      color: white;
      margin: 0 0 0.5rem;
    }
    .footer-brand p {
      color: #8a8a87;
      max-width: 320px;
      font-size: 0.92rem;
    }
    .footer-col {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .footer-col h5 {
      font-size: 0.7rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--accent);
      margin: 0 0 0.6rem;
      font-weight: 600;
    }
    .footer-col a {
      color: #d8d4cb;
      font-size: 0.9rem;
      cursor: pointer;
    }
    .footer-col a:hover { color: white; }
    .footer-bottom {
      padding: 1.5rem 0 0;
      display: flex;
      justify-content: space-between;
      font-size: 0.78rem;
      color: #6a6a67;
    }
    @media (max-width: 768px) {
      .footer-inner { grid-template-columns: 1fr 1fr; gap: 2rem; }
      .footer-bottom { flex-direction: column; gap: 0.5rem; text-align: center; }
    }
  `],
})
export class FooterComponent {
  year = new Date().getFullYear();
}
