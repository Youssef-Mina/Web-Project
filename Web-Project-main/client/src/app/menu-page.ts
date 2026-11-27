import { Component, InjectionToken, OnInit, inject, input, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { EgpPipe } from './egp.pipe';
import { TableMenu, fetchMenu } from './menu-api';

// The loader is injectable so tests can swap in a fake one.
export const MENU_LOADER = new InjectionToken<(qrToken: string) => Promise<TableMenu>>('MENU_LOADER', {
  providedIn: 'root',
  factory: () => (qrToken: string) => fetchMenu(qrToken),
});

type MenuState =
  | { kind: 'loading' }
  | { kind: 'ready'; data: TableMenu }
  | { kind: 'error'; message: string };

@Component({
  selector: 'app-menu-page',
  imports: [EgpPipe],
  templateUrl: './menu-page.html',
  styleUrl: './menu-page.css',
})
export class MenuPage implements OnInit {
  /** From the URL /t/:qrToken (router input binding). */
  readonly qrToken = input.required<string>();

  protected readonly state = signal<MenuState>({ kind: 'loading' });

  private readonly loadMenu = inject(MENU_LOADER);
  private readonly title = inject(Title);

  ngOnInit(): void {
    this.load();
  }

  protected async load(): Promise<void> {
    this.state.set({ kind: 'loading' });
    try {
      const data = await this.loadMenu(this.qrToken());
      this.title.setTitle(`${data.restaurant.name} · Table ${data.table.number}`);
      this.state.set({ kind: 'ready', data });
    } catch (err) {
      this.title.setTitle('Menu unavailable');
      this.state.set({ kind: 'error', message: (err as Error).message });
    }
  }

  protected jumpTo(categoryId: string): void {
    document.getElementById(`cat-${categoryId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
