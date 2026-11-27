import { routes } from './app.routes';
import { MenuPage } from './menu-page';
import { ScanPrompt } from './scan-prompt';

describe('routes', () => {
  it('sends /t/:qrToken to the menu page', () => {
    expect(routes.find((r) => r.path === 't/:qrToken')?.component).toBe(MenuPage);
  });

  it('sends every other URL to the scan prompt', () => {
    expect(routes.find((r) => r.path === '**')?.component).toBe(ScanPrompt);
  });
});
