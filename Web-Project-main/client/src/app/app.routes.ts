import { Routes } from '@angular/router';
import { MenuPage } from './menu-page';
import { ScanPrompt } from './scan-prompt';

export const routes: Routes = [
  { path: 't/:qrToken', component: MenuPage },
  { path: '**', component: ScanPrompt },
];
