import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MenuPage, MENU_LOADER } from './menu-page';
import { TableMenu } from './menu-api';

function sampleMenu(overrides: Partial<TableMenu> = {}): TableMenu {
  return {
    restaurant: { name: 'Nile Café', slug: 'nile-cafe', currency: 'EGP', orderingOpen: true },
    table: { number: '7' },
    menu: [
      {
        id: 'c1',
        name: 'Hot drinks',
        items: [
          { id: 'i1', name: 'Turkish coffee', description: 'Strong, with cardamom', pricePiastres: 4550, isAvailable: true },
          { id: 'i2', name: 'Sahlab', description: '', pricePiastres: 6000, isAvailable: false },
        ],
      },
    ],
    ...overrides,
  };
}

describe('MenuPage', () => {
  let fixture: ComponentFixture<MenuPage>;
  let calls: string[];
  let next: () => Promise<TableMenu>;

  async function render(loader: () => Promise<TableMenu>) {
    calls = [];
    next = loader;
    await TestBed.configureTestingModule({
      imports: [MenuPage],
      providers: [{ provide: MENU_LOADER, useValue: (token: string) => { calls.push(token); return next(); } }],
    }).compileComponents();
    fixture = TestBed.createComponent(MenuPage);
    fixture.componentRef.setInput('qrToken', 'tok-1234567890abcdef');
    await settle();
  }

  async function settle() {
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  }

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  it('shows the loading text while the menu is on its way', async () => {
    await render(() => new Promise(() => {}));
    expect(text()).toContain('Loading menu…');
    expect(calls).toEqual(['tok-1234567890abcdef']);
  });

  it('shows restaurant, table, category, dishes and EGP prices', async () => {
    await render(async () => sampleMenu());
    expect(text()).toContain('Nile Café');
    expect(text()).toContain('Table 7');
    expect(text()).toContain('Hot drinks');
    expect(text()).toContain('Turkish coffee');
    expect(text()).toContain('Strong, with cardamom');
    expect(text()).toContain('45.50');
    expect(text()).not.toContain('Loading menu…');
  });

  it('marks a sold-out dish', async () => {
    await render(async () => sampleMenu());
    const rows = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.dish'));
    const sahlab = rows.find((row) => row.textContent?.includes('Sahlab'));
    expect(sahlab?.textContent).toContain('Sold out');
    expect(sahlab?.classList).toContain('sold-out');
    const coffee = rows.find((row) => row.textContent?.includes('Turkish coffee'));
    expect(coffee?.textContent).not.toContain('Sold out');
  });

  it('shows the closed banner only when ordering is not open', async () => {
    await render(async () => sampleMenu());
    expect(text()).not.toContain('Ordering is unavailable right now.');

    TestBed.resetTestingModule();
    await render(async () =>
      sampleMenu({ restaurant: { name: 'Cairo Grill', slug: 'cairo-grill', currency: 'EGP', orderingOpen: false } }),
    );
    expect(text()).toContain('Ordering is unavailable right now.');
  });

  it('shows an empty message when there are no dishes', async () => {
    await render(async () => sampleMenu({ menu: [] }));
    expect(text()).toContain('No dishes yet.');
  });

  it('shows the error message and a Retry button that loads again', async () => {
    let fail = true;
    await render(async () => {
      if (fail) throw new Error("This QR code isn't active. Please ask staff.");
      return sampleMenu();
    });
    expect(text()).toContain("This QR code isn't active. Please ask staff.");

    fail = false;
    const retry = (fixture.nativeElement as HTMLElement).querySelector('button.retry') as HTMLButtonElement;
    expect(retry.textContent?.trim()).toBe('Retry');
    retry.click();
    await settle();

    expect(calls.length).toBe(2);
    expect(text()).toContain('Turkish coffee');
  });

  it('shows menu text literally, never as HTML', async () => {
    const menu = sampleMenu();
    menu.menu[0].items[0].name = '<b>x</b>';
    await render(async () => menu);
    const html = (fixture.nativeElement as HTMLElement);
    expect(html.querySelector('.dish b')).toBeNull();
    expect(text()).toContain('<b>x</b>');
  });

  it('sets the page title to the restaurant and table', async () => {
    await render(async () => sampleMenu());
    expect(document.title).toBe('Nile Café · Table 7');
  });
});
