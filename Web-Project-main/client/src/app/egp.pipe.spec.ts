import { EgpPipe } from './egp.pipe';

describe('EgpPipe', () => {
  const pipe = new EgpPipe();

  it('formats whole piastres as EGP with two decimals', () => {
    const text = pipe.transform(8550);
    expect(text).toContain('EGP');
    expect(text).toContain('85.50');
  });

  it('formats zero as 0.00', () => {
    expect(pipe.transform(0)).toContain('0.00');
  });

  it('does not drift on values that are inexact as floats', () => {
    // 1999 piastres / 100 must show 19.99, never 19.989999...
    expect(pipe.transform(1999)).toContain('19.99');
  });
});
