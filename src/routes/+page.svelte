<script lang="ts">
	import type { Game } from '$lib/types';

	let query = '';
	let results: Game[] = [];
	let loading = false;

	async function searchGames() {
		if (!query.trim()) return;

		loading = true;

		// Make a call to your backend (or directly to IGDB, depending on setup)
		const res = await fetch('/api/search?query=' + encodeURIComponent(query));
		results = await res.json();

		loading = false;
	}
</script>

<input
	type="text"
	placeholder="Search for a game..."
	bind:value={query}
	on:keydown={(e) => e.key === 'Enter' && searchGames()}
/>

{#if loading}
	<p>Loading...</p>
{:else if results.length}
	<ul>
		{#each results as game}
			<li>{game.name}</li>
		{/each}
	</ul>
{/if}
