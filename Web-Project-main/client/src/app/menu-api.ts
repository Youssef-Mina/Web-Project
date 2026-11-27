// Shape of GET /api/public/tables/:qrToken (server/src/routes/public.js)
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  pricePiastres: number;
  isAvailable: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface TableMenu {
  restaurant: { name: string; slug: string; currency: string; orderingOpen: boolean };
  table: { number: string };
  menu: MenuCategory[];
}

export const GENERIC_ERROR = 'Could not load the menu. Please try again.';

// Production-safe fetch (Week 6): check response.ok and always end with a clear message.
export async function fetchMenu(qrToken: string, fetchFn: typeof fetch = fetch): Promise<TableMenu> {
  let response: Response;
  let body: unknown;

  try {
    response = await fetchFn(`/api/public/tables/${encodeURIComponent(qrToken)}`);
    body = await response.json();
  } catch {
    throw new Error(GENERIC_ERROR); // offline, or the reply wasn't JSON
  }

  if (!response.ok) {
    const serverMessage = (body as { error?: unknown } | null)?.error;
    throw new Error(typeof serverMessage === 'string' && serverMessage ? serverMessage : GENERIC_ERROR);
  }

  return body as TableMenu;
}
