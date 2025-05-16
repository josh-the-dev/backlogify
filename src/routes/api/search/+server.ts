import type { Game } from '$lib/types';
import { json, type RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent) {
  const query = event.url.searchParams.get('query');
  if (!query) return json([]);
	if (!query) return json([]);

	// TEMP MOCK - Replace with IGDB call later
	const results: Game[] = [
		{
			id: 1,
			name: 'Hollow Knight',
			cover: { id: 1, url: '/mock-cover.png' },
			first_release_date: 1490572800,
			platforms: [{ name: 'PC' }]
		}
	];

	return json(results);
}