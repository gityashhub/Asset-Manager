import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <div class="container">
        <div class="auth-card">
          <span class="eyebrow">Join the atelier</span>
          <h1>Create an account</h1>
          <p class="muted">Save pieces, track orders, and shop with the concierge.</p>

          <form (ngSubmit)="submit()" #f="ngForm" class="form">
            <div class="field">
              <label>Full name</label>
              <input name="name" [(ngModel)]="name" required>
            </div>
            <div class="field">
              <label>Email</label>
              <input type="email" name="email" [(ngModel)]="email" required>
            </div>
            <div class="field">
              <label>Password</label>
              <input type="password" name="password" [(ngModel)]="password" required minlength="6">
              <small class="muted">At least 6 characters.</small>
            </div>

            @if (error()) { <div class="alert alert-error">{{ error() }}</div> }

            <button class="btn btn-lg" type="submit" [disabled]="loading() || f.invalid">
              {{ loading() ? 'Creating…' : 'Create account' }}
            </button>

            <p class="alt">Already have an account? <a routerLink="/login">Sign in</a></p>
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
    .auth-card h1 { font-size: 2.2rem; margin: 0.4rem 0; }
    .auth-card .muted { margin-bottom: 2rem; }
    .form button { width: 100%; }
    small { display: block; margin-top: 0.4rem; font-size: 0.78rem; }
    .alt {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.9rem;
      color: var(--ink-soft);
    }
    .alt a { color: var(--accent); font-weight: 600; }
  `],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private cart = inject(CartService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  submit(): void {
    this.loading.set(true);
    this.error.set('');
    this.auth.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.cart.refreshIfAuthed();
        this.router.navigate(['/']);
      },
      error: (e) => {
        this.error.set(e?.error?.message || 'Could not create account');
        this.loading.set(false);
      },
    });
  }
}
