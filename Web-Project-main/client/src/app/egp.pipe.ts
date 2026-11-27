import { Pipe, PipeTransform } from '@angular/core';

// Money travels as whole piastres (EGP x 100). This pipe is the only place it becomes EGP text.
const formatter = new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' });

@Pipe({ name: 'egp' })
export class EgpPipe implements PipeTransform {
  transform(piastres: number): string {
    return formatter.format(piastres / 100);
  }
}
