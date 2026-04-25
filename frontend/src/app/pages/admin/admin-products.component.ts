import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <header class="page-head">
      <div>
        <span class="eyebrow">Catalogue</span>
        <h1>Products</h1>
        <p class="muted">Add, edit, and remove watches from your atelier.</p>
      </div>
      <button class="btn" (click)="openNew()">+ New product</button>
    </header>

    @if (loading()) { <p class="muted">Loading…</p> }
    @else {
      <div class="card-block">
        <table>
          <thead>
            <tr>
              <th></th><th>Name</th><th>Brand</th><th>Category</th>
              <th>Price</th><th>Stock</th><th>Featured</th><th></th>
            </tr>
          </thead>
          <tbody>
            @for (p of products(); track p._id) {
              <tr>
                <td>
                  @if (p.images?.[0]) {
                    <img [src]="p.images[0]" [alt]="p.name" class="thumb">
                  }
                </td>
                <td><strong>{{ p.name }}</strong></td>
                <td>{{ p.brand }}</td>
                <td>{{ p.category }}</td>
                <td>{{ p.price | currency:'USD':'symbol':'1.0-0' }}</td>
                <td>
                  <span class="badge" [class.badge-warning]="p.stock <= 3" [class.badge-success]="p.stock > 3">
                    {{ p.stock }}
                  </span>
                </td>
                <td>{{ p.featured ? 'Yes' : '—' }}</td>
                <td class="actions">
                  <button class="btn btn-outline btn-sm" (click)="openEdit(p)">Edit</button>
                  <button class="btn btn-ghost btn-sm danger" (click)="remove(p)">Delete</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    @if (editing()) {
      <div class="modal-backdrop" (click)="closeEdit()">
        <div class="modal" (click)="$event.stopPropagation()">
          <header>
            <h3>{{ editing()!._id ? 'Edit product' : 'New product' }}</h3>
            <button class="close" (click)="closeEdit()">×</button>
          </header>

          <div class="form-body">
            <div class="fields-row cols-2">
              <div class="field">
                <label>Name</label>
                <input [(ngModel)]="editing()!.name">
              </div>
              <div class="field">
                <label>Brand</label>
                <input [(ngModel)]="editing()!.brand">
              </div>
            </div>

            <div class="field">
              <label>Description</label>
              <textarea rows="3" [(ngModel)]="editing()!.description"></textarea>
            </div>

            <div class="fields-row cols-3">
              <div class="field">
                <label>Price</label>
                <input type="number" [(ngModel)]="editing()!.price">
              </div>
              <div class="field">
                <label>Original price</label>
                <input type="number" [(ngModel)]="editing()!.originalPrice">
              </div>
              <div class="field">
                <label>Stock</label>
                <input type="number" [(ngModel)]="editing()!.stock">
              </div>
            </div>

            <div class="fields-row cols-3">
              <div class="field">
                <label>Category</label>
                <select [(ngModel)]="editing()!.category">
                  @for (c of categories; track c) { <option [ngValue]="c">{{ c }}</option> }
                </select>
              </div>
              <div class="field">
                <label>Movement</label>
                <select [(ngModel)]="editing()!.movement">
                  @for (m of movements; track m) { <option [ngValue]="m">{{ m }}</option> }
                </select>
              </div>
              <div class="field">
                <label>Case size</label>
                <input [(ngModel)]="editing()!.caseSize">
              </div>
            </div>

            <div class="fields-row cols-2">
              <div class="field">
                <label>Case material</label>
                <input [(ngModel)]="editing()!.caseMaterial">
              </div>
              <div class="field">
                <label>Water resistance</label>
                <input [(ngModel)]="editing()!.waterResistance">
              </div>
            </div>

            <div class="field">
              <label>Image URLs (one per line)</label>
              <textarea rows="3" [(ngModel)]="imagesText"></textarea>
            </div>

            <div class="field check">
              <label>
                <input type="checkbox" [(ngModel)]="editing()!.featured">
                <span>Featured on home page</span>
              </label>
            </div>

            @if (formError()) { <div class="alert alert-error">{{ formError() }}</div> }
          </div>

          <footer>
            <button class="btn btn-outline" (click)="closeEdit()">Cancel</button>
            <button class="btn" (click)="save()" [disabled]="saving()">
              {{ saving() ? 'Saving…' : 'Save product' }}
            </button>
          </footer>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-head {
      display: flex;
      justify-content: space-between;
      align-items: end;
      margin-bottom: 2rem;
    }
    .page-head h1 { margin: 0.4rem 0 0.3rem; }
    .card-block {
      background: white;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .thumb {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: var(--radius);
      background: #f5f2ec;
    }
    td.actions { display: flex; gap: 0.4rem; justify-content: flex-end; }
    .danger { color: var(--danger); }
    .danger:hover { background: rgba(192, 57, 43, 0.08); }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(20, 14, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 1rem;
    }
    .modal {
      background: white;
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 720px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .modal header {
      padding: 1.25rem 1.75rem;
      border-bottom: 1px solid var(--line);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal header h3 { margin: 0; }
    .close {
      background: transparent;
      border: none;
      color: var(--muted);
      font-size: 2rem;
      padding: 0;
      width: 32px;
      height: 32px;
      cursor: pointer;
      line-height: 1;
    }
    .close:hover { color: var(--ink); background: transparent; }
    .form-body {
      padding: 1.5rem 1.75rem;
      overflow-y: auto;
    }
    .check label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; text-transform: none; letter-spacing: 0; font-size: 0.92rem; color: var(--ink); }
    .check input[type="checkbox"] { width: auto; }
    .modal footer {
      padding: 1.25rem 1.75rem;
      border-top: 1px solid var(--line);
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }
  `],
})
export class AdminProductsComponent implements OnInit {
  private productsService = inject(ProductsService);

  products = signal<Product[]>([]);
  loading = signal(true);
  editing = signal<Partial<Product> | null>(null);
  imagesText = '';
  saving = signal(false);
  formError = signal('');

  categories = ['Luxury', 'Sport', 'Classic', 'Smart', 'Diver', 'Dress', 'Pilot'];
  movements = ['Automatic', 'Quartz', 'Mechanical', 'Solar', 'Smart'];

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading.set(true);
    this.productsService.list({ limit: 60 }).subscribe({
      next: (r) => {
        this.products.set(r.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openNew(): void {
    this.editing.set({
      name: '',
      brand: '',
      description: '',
      price: 0,
      stock: 0,
      images: [],
      category: 'Classic',
      movement: 'Automatic',
      caseMaterial: 'Stainless Steel',
      caseSize: '40mm',
      waterResistance: '50m',
      featured: false,
    });
    this.imagesText = '';
    this.formError.set('');
  }

  openEdit(p: Product): void {
    this.editing.set({ ...p });
    this.imagesText = (p.images || []).join('\n');
    this.formError.set('');
  }

  closeEdit(): void {
    this.editing.set(null);
  }

  save(): void {
    const e = this.editing();
    if (!e) return;
    if (!e.name || !e.brand || e.price == null) {
      this.formError.set('Name, brand and price are required.');
      return;
    }
    const payload: Partial<Product> = {
      ...e,
      price: Number(e.price) || 0,
      originalPrice: e.originalPrice ? Number(e.originalPrice) : undefined,
      stock: Number(e.stock) || 0,
      images: this.imagesText.split(/\n+/).map((s) => s.trim()).filter(Boolean),
    };
    this.saving.set(true);
    const obs = e._id
      ? this.productsService.update(e._id, payload)
      : this.productsService.create(payload);
    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeEdit();
        this.fetch();
      },
      error: (err) => {
        this.formError.set(err?.error?.message || 'Save failed');
        this.saving.set(false);
      },
    });
  }

  remove(p: Product): void {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    this.productsService.delete(p._id).subscribe({
      next: () => this.fetch(),
    });
  }
}
