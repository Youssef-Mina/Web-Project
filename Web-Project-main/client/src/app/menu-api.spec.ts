import { fetchMenu, GENERIC_ERROR, TableMenu } from './menu-api';

const sample: TableMenu = {
  restaurant: { name: 'Nile Café', slug: 'nile-cafe', currency: 'EGP', orderingOpen: true },
  table: { number: '7' },
  menu: [],
};

function respond(status: number, body: unknown): typeof fetch {
  return (async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })) as typeof fetch;
}

describe('fetchMenu', () => {
  it('resolves the menu body when the response is ok', async () => {
    await expect(fetchMenu('abcdefghijklmnop', respond(200, sample))).resolves.toEqual(sample);
  });

  it('requests /api/public/tables/<token> with the token URL-encoded', async () => {
    let url = '';
    const spy = (async (input: RequestInfo | URL) => {
      url = String(input);
      return new Response(JSON.stringify(sample), { status: 200 });
    }) as typeof fetch;

    await fetchMenu('a/b c', spy);

    expect(url).toBe('/api/public/tables/a%2Fb%20c');
  });

  it("rejects with the server's error message on 404", async () => {
    const notActive = "This QR code isn't active. Please ask staff.";
    await expect(fetchMenu('x', respond(404, { error: notActive }))).rejects.toThrow(notActive);
  });

  it('rejects with the generic message when an error response has no error field', async () => {
    await expect(fetchMenu('x', respond(500, {}))).rejects.toThrow(GENERIC_ERROR);
  });

  it('rejects with the generic message when the body is not JSON', async () => {
    const html = (async () => new Response('<html>Gateway Timeout</html>', { status: 504 })) as typeof fetch;
    await expect(fetchMenu('x', html)).rejects.toThrow(GENERIC_ERROR);
  });

  it('rejects with the generic message when the network fails', async () => {
    const offline = (async () => {
      throw new TypeError('Failed to fetch');
    }) as typeof fetch;
    await expect(fetchMenu('x', offline)).rejects.toThrow(GENERIC_ERROR);
  });

  it('uses exactly the agreed generic copy', () => {
    expect(GENERIC_ERROR).toBe('Could not load the menu. Please try again.');
  });
});
