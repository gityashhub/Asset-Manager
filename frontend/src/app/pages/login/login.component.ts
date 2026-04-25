import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <div class="container">
        <div class="auth-card">
          <span class="eyebrow">Welcome back</span>
          <h1>Sign in</h1>
          <p class="muted">Continue your collection.</p>

          <form (ngSubmit)="submit()" #f="ngForm" class="form">
            <div class="field">
              <label>Email</label>
              <input type="email" name="email" [(ngModel)]="email" required>
            </div>
            <div class="field">
              <label>Password</label>
              <input type="password" name="password" [(ngModel)]="password" required>
            </div>

            @if (error()) { <div class="alert alert-error">{{ error() }}</div> }

            <button class="btn btn-lg" type="submit" [disabled]="loading() || f.invalid">
              {{ loading() ? 'Signing in…' : 'Sign in' }}
            </button>

            <p class="alt">New to Maison Tempus? <a routerLink="/register">Create an account</a></p>

            <div class="hint">
              <strong>Demo accounts</strong>
              <span>Admin: admin&#64;watchstore.test / admin1234</span>
            </div>
          </form>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      padding: 4rem 0;
      background: linear-gradient(180deg, #f5f2ec 0%, var(--bg) 100%);
    }
    .auth-card {
      max-width: 460px;
      margin: 0 auto;
      background: white;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      padding: 3rem;
      box-shadow: var(--shadow);
    }
    .auth-card h1 { font-size: 2.2rem; margin: 0.4rem 0 0.4rem; }
    .auth-card .muted { margin-bottom: 2rem; }
    .form button { width: 100%; }
    .alt {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.9rem;
      color: var(--ink-soft);
    }
    .alt a { color: var(--accent); font-weight: 600; }
    .hint {
      margin-top: 1.5rem;
      padding: 1rem;
      background: var(--accent-soft);
      border-radius: var(--radius);
      font-size: 0.82rem;
      color: var(--accent-deep);
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .hint strong { font-size: 0.7rem; letter-spacing: 0.16em; text-transform: uppercase; }
  `],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private cart = inject(CartService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  submit(): void {
    this.loading.set(true);
    this.error.set('');
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.cart.refreshIfAuthed();
        const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/';
        this.router.navigateByUrl(redirect);
      },
      error: (e) => {
        this.error.set(e?.error?.message || 'Sign in failed');
        this.loading.set(false);
      },
    });
  }
}
