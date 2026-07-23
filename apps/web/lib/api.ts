export type Title = {
  id: string; name: string; synopsis: string; type: "movie" | "series"; genres: string[];
  maturity_rating: number; release_year: number; media_meta: string; image: string;
  available: boolean; tier: number; published: boolean; in_watchlist?: boolean;
};

export type Plan = { id: string; name: string; price: number; quality: string; stream_limit: number; tier: number; features: string };
export type Profile = { id: string; name: string; avatar: string; maturity_limit: number; active: boolean };

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, { credentials: "include", ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Something went wrong." }));
    throw new Error(error.message);
  }
  return response.status === 204 ? undefined as T : response.json();
}
