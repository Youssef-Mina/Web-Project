import { Component } from '@angular/core';

@Component({
  selector: 'app-scan-prompt',
  template: `
    <main class="prompt">
      <h1>Scan the QR code on your table to see the menu.</h1>
    </main>
  `,
  styles: `
    .prompt { max-width: 420px; margin: 0 auto; padding: 96px 24px; }
    h1 { margin: 0; font-family: var(--serif); font-size: 1.8rem; line-height: 1.2; }
  `,
})
export class ScanPrompt {}
