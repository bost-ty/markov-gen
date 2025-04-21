<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { names as egyptianNames } from '$lib/data/egyptian.json';
	import { MarkovGenerator } from '$lib/markov';

	type CategoryData = {
		name: string;
		model: MarkovGenerator;
	};

	let categories: CategoryData[] = $state([
		{
			name: 'Custom',
			model: new MarkovGenerator([])
		},
		{
			name: 'Egyptian',
			model: new MarkovGenerator(egyptianNames)
		}
	]);

	let customText = $state<string>(
		'Replace this with source data, one entry per line.'
	);
	let customData = $derived(
		customText.split(/\s+/).filter((word) => word.length > 0)
	);

	let currentCategory = $state<CategoryData | undefined>(categories[0]);
	let currentGenerated = $state<SvelteSet<string>>(new SvelteSet());

	let termAttempts = $state(0);
	const termAttemptLimit = 500;
	let termCount = $state(1);
	let requestedTermCount = $state(0);

	const generateNew = (): void => {
		if (!currentCategory) return;
		requestedTermCount = termCount;
		termAttempts = 0;

		let newTerms: SvelteSet<string> = new SvelteSet();
		const model =
			currentCategory.name === 'Custom'
				? new MarkovGenerator(customData)
				: currentCategory.model;

		try {
			while (
				newTerms.size <= requestedTermCount - 1 &&
				termAttempts < termAttemptLimit
			) {
				let term = model.generate();
				newTerms.add(term);
				termAttempts++;
			}
		} catch (err) {
			let msg = `Error: could not generate based on model/data (${err})`;
			console.error(msg);
			currentGenerated = new SvelteSet([msg]);
			return;
		}
		currentGenerated = newTerms;
	};

	$effect(() => {
		if (currentCategory) currentGenerated = new SvelteSet();
	});
</script>

<div class="p-2 flex flex-col items-center justify-center gap-2">
	<h1 class="text-xl">Markov Generator</h1>
	<select bind:value={currentCategory} class="border p-1 text-center">
		{#each categories as category (category.name)}
			<option value={category}>{category.name}</option>
		{/each}
	</select>
	<input
		class="text-center w-15"
		min="1"
		max="20"
		type="number"
		name="number"
		bind:value={termCount}
	/>
	{#if currentCategory?.name === 'Custom'}
		<textarea class="border p-1 w-full max-w-[80ch]" bind:value={customText}
		></textarea>
	{/if}
	<button
		class="border rounded-full px-3 py-1 cursor-pointer hover:bg-neutral-50 active:translate-y-0.5"
		type="button"
		onclick={generateNew}>Generate</button
	>
	{#if currentGenerated.size > 0}
		<p>
			Generated {currentGenerated.size}/{requestedTermCount} unique terms in {termAttempts}
			attempts.
		</p>
		<ul class="p-1 my-1 w-full bg-neutral-50 max-w-[80ch] border">
			{#each currentGenerated as term}
				<li>{term}</li>
			{/each}
		</ul>
	{/if}
</div>
