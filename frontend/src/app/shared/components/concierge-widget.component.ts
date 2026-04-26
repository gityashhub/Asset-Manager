import { Component, ElementRef, inject, signal, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConciergeMessage, ConciergePick, ConciergeService } from '../../core/services/concierge.service';

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
  picks?: ConciergePick[];
}

@Component({
  selector: 'app-concierge-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, RouterLink],
  template: `
    <button
      type="button"
      class="fab"
      [class.open]="open()"
      (click)="toggle()"
      [attr.aria-label]="open() ? 'Close concierge' : 'Open concierge'">
      @if (open()) {
        <span class="x">×</span>
      } @else {
        <span class="ico">◆</span>
        <span class="lbl">Concierge</span>
      }
    </button>

    @if (open()) {
      <section class="panel" role="dialog" aria-label="AI Watch Concierge">
        <header class="panel-head">
          <div>
            <span class="eyebrow">AI Concierge</span>
            <h3>Watch Hub</h3>
          </div>
          <button type="button" class="reset" (click)="reset()" title="Start a new conversation">↻</button>
        </header>

        <div class="messages" #scrollArea>
          @if (turns().length === 0) {
            <div class="welcome">
              <p>Bonjour. I am your private concierge. Tell me what you're looking for — an occasion, a budget, a style — and I'll guide you through the atelier.</p>
              <div class="suggestions">
                @for (s of suggestions; track s) {
                  <button type="button" class="chip" (click)="send(s)">{{ s }}</button>
                }
              </div>
            </div>
          }

          @for (t of turns(); track $index) {
            <div class="msg" [class.user]="t.role === 'user'" [class.assistant]="t.role === 'assistant'">
              <div class="bubble">{{ t.content }}</div>
              @if (t.picks && t.picks.length) {
                <div class="picks">
                  @for (p of t.picks; track p._id) {
                    <a class="pick" [routerLink]="['/product', p._id]" (click)="open.set(false)">
                      <strong>{{ p.name }}</strong>
                      <span class="muted small">{{ p.brand }}</span>
                      <span class="price">{{ p.price | currency:'USD':'symbol':'1.0-0' }}</span>
                    </a>
                  }
                </div>
              }
            </div>
          }

          @if (loading()) {
            <div class="msg assistant">
              <div class="bubble typing"><span></span><span></span><span></span></div>
            </div>
          }

          @if (errorMessage()) {
            <div class="error-bubble">{{ errorMessage() }}</div>
          }
        </div>

        <form class="composer" (ngSubmit)="send(input)">
          <input
            type="text"
            [(ngModel)]="input"
            name="msg"
            placeholder="Ask the concierge…"
            autocomplete="off"
            [disabled]="loading()"
            maxlength="500" />
          <button type="submit" [disabled]="loading() || !input.trim()">Send</button>
        </form>
        <p class="footnote">AI suggestions are powered by Llama. Recommendations are drawn from the atelier's live catalogue.</p>
      </section>
    }
  `,
  styles: [`
    :host { position: fixed; right: 1.25rem; bottom: 1.25rem; z-index: 1000; font-family: var(--sans, system-ui); }
    .fab {
      display: inline-flex; align-items: center; gap: 0.6rem;
      padding: 0.85rem 1.2rem; border-radius: 999px;
      background: var(--ink, #1a1a1a); color: white;
      border: none; cursor: pointer;
      box-shadow: 0 12px 32px rgba(0,0,0,0.22);
      font-size: 0.85rem; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600;
      transition: transform 0.18s, box-shadow 0.18s;
    }
    .fab:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(0,0,0,0.28); }
    .fab.open { padding: 0.7rem 0.95rem; }
    .fab .ico { color: var(--accent, #c9a96b); font-size: 1rem; }
    .fab .x { font-size: 1.3rem; line-height: 1; }
    .panel {
      position: absolute; right: 0; bottom: 4.2rem;
      width: min(380px, calc(100vw - 2.5rem));
      height: min(560px, calc(100vh - 8rem));
      background: white; border: 1px solid var(--line, #ebe7df);
      border-radius: 18px; overflow: hidden;
      display: flex; flex-direction: column;
      box-shadow: 0 24px 60px rgba(0,0,0,0.22);
      animation: slideUp 0.22s ease-out;
    }
    @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .panel-head {
      padding: 1rem 1.1rem; border-bottom: 1px solid var(--line, #ebe7df);
      display: flex; justify-content: space-between; align-items: center;
      background: var(--bg, #f8f6f1);
    }
    .panel-head .eyebrow { font-size: 0.65rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent-deep, #8a7440); font-weight: 700; }
    .panel-head h3 { margin: 0.15rem 0 0; font-family: var(--serif, Georgia); font-size: 1.05rem; }
    .reset {
      background: none; border: 1px solid var(--line, #ebe7df);
      width: 32px; height: 32px; border-radius: 50%;
      cursor: pointer; color: var(--muted, #8a8478); font-size: 0.95rem;
    }
    .reset:hover { color: var(--ink); border-color: var(--ink); }
    .messages {
      flex: 1; overflow-y: auto; padding: 1.1rem;
      display: flex; flex-direction: column; gap: 0.85rem;
    }
    .welcome { color: var(--ink-soft, #4a4a48); font-size: 0.92rem; line-height: 1.55; }
    .welcome p { margin: 0 0 0.95rem; }
    .suggestions { display: flex; flex-direction: column; gap: 0.45rem; }
    .chip {
      text-align: left; background: white; border: 1px solid var(--line, #ebe7df);
      padding: 0.6rem 0.85rem; border-radius: 10px; cursor: pointer;
      font-size: 0.85rem; color: var(--ink); transition: all 0.15s;
    }
    .chip:hover { background: var(--accent-soft, #f5efe1); border-color: var(--accent, #c9a96b); }
    .msg { display: flex; flex-direction: column; max-width: 92%; }
    .msg.user { align-self: flex-end; align-items: flex-end; }
    .msg.assistant { align-self: flex-start; align-items: flex-start; }
    .bubble {
      padding: 0.7rem 0.95rem; border-radius: 14px;
      font-size: 0.9rem; line-height: 1.5; white-space: pre-wrap;
    }
    .msg.user .bubble { background: var(--ink, #1a1a1a); color: white; border-bottom-right-radius: 4px; }
    .msg.assistant .bubble { background: var(--bg, #f8f6f1); color: var(--ink); border-bottom-left-radius: 4px; }
    .typing { display: inline-flex; gap: 4px; padding: 0.85rem 1rem; }
    .typing span {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--muted, #8a8478); animation: blink 1.2s infinite;
    }
    .typing span:nth-child(2) { animation-delay: 0.2s; }
    .typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes blink { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }
    .picks {
      margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.4rem; width: 100%;
    }
    .pick {
      display: grid; grid-template-columns: 1fr auto; gap: 0.25rem 0.75rem;
      padding: 0.65rem 0.85rem; border: 1px solid var(--line, #ebe7df);
      border-radius: 10px; text-decoration: none; color: var(--ink);
      background: white; transition: all 0.15s;
    }
    .pick:hover { border-color: var(--accent, #c9a96b); background: var(--accent-soft, #f5efe1); }
    .pick strong { font-size: 0.88rem; }
    .pick .small { font-size: 0.72rem; grid-column: 1; }
    .pick .price { grid-row: 1 / 3; align-self: center; font-weight: 700; }
    .error-bubble {
      align-self: center; padding: 0.6rem 0.85rem; border-radius: 10px;
      background: #fef2f2; color: #b91c1c; font-size: 0.82rem; border: 1px solid #fecaca;
    }
    .composer {
      display: flex; gap: 0.5rem; padding: 0.75rem 0.85rem 0.5rem;
      border-top: 1px solid var(--line, #ebe7df);
    }
    .composer input {
      flex: 1; padding: 0.65rem 0.85rem; border: 1px solid var(--line, #ebe7df);
      border-radius: 10px; font-size: 0.9rem; font-family: inherit; outline: none;
    }
    .composer input:focus { border-color: var(--ink, #1a1a1a); }
    .composer button {
      padding: 0 1.1rem; border: none; border-radius: 10px;
      background: var(--ink, #1a1a1a); color: white; cursor: pointer;
      font-size: 0.85rem; font-weight: 600; letter-spacing: 0.04em;
    }
    .composer button:disabled { background: #c5c1b8; cursor: not-allowed; }
    .footnote {
      margin: 0; padding: 0 1rem 0.7rem;
      font-size: 0.68rem; color: var(--muted, #8a8478); text-align: center;
    }
    .muted { color: var(--muted, #8a8478); }
    .small { font-size: 0.78rem; }
    @media (max-width: 480px) {
      :host { right: 0.85rem; bottom: 0.85rem; }
      .panel { width: calc(100vw - 1.7rem); height: calc(100vh - 6rem); }
    }
  `],
})
export class ConciergeWidgetComponent implements AfterViewChecked {
  private api = inject(ConciergeService);
  @ViewChild('scrollArea') private scrollArea?: ElementRef<HTMLDivElement>;

  open = signal(false);
  loading = signal(false);
  turns = signal<ChatTurn[]>([]);
  errorMessage = signal<string | null>(null);
  input = '';

  suggestions = [
    'I need a dress watch under $5,000',
    'Show me your most striking automatics',
    'A gift for a pilot — what do you suggest?',
    'Compare two of your top picks',
  ];

  private shouldScroll = false;

  toggle(): void {
    this.open.update((v) => !v);
  }

  reset(): void {
    this.turns.set([]);
    this.errorMessage.set(null);
    this.input = '';
  }

  send(text: string): void {
    const content = (text || '').trim();
    if (!content || this.loading()) return;
    this.errorMessage.set(null);
    this.input = '';

    this.turns.update((list) => [...list, { role: 'user', content }]);
    this.shouldScroll = true;
    this.loading.set(true);

    const history: ConciergeMessage[] = this.turns().map((t) => ({ role: t.role, content: t.content }));

    this.api.ask(history).subscribe({
      next: (res) => {
        this.turns.update((list) => [
          ...list,
          { role: 'assistant', content: res.reply || 'I am here to help. Could you share a little more?', picks: res.picks },
        ]);
        this.shouldScroll = true;
        this.loading.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message || 'The concierge is briefly unavailable. Please try again.';
        this.errorMessage.set(msg);
        this.loading.set(false);
      },
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.scrollArea?.nativeElement) {
      const el = this.scrollArea.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }
}
