<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import { names as egyptianNames } from '$lib/data/egyptian.json';

	interface FrequencyMap {
		[choice: string]: number;
	}

	interface RawModel {
		termCount: FrequencyMap;
		termLength: FrequencyMap;
		initialUnit: FrequencyMap;
		[unitKey: string]: FrequencyMap;
	}

	interface WeightTotalsMap {
		[category: string]: number;
	}

	interface WeightedModel extends RawModel {
		selectionWeights: WeightTotalsMap;
	}

	// Source name arrays
	const sourceDataMap: Map<string, string[]> = new SvelteMap();
	sourceDataMap.set('egyptian', egyptianNames);

	// Cache for constructed & scaled chains
	const modelCache: Map<string, WeightedModel> = new SvelteMap();

	const generateSequence = (category: string): string => {
		const model = getModel(category) || false;
		return model ? getModel(model) : '';
	};

	const generateSequenceList = (type: NameType, n: number) => {
		let list: NameString[] = [];
		for (let i = 0; i < n; i++) {
			list.push(generateName(type));
		}
		return list;
	};

	const getModel = (category: string): WeightedModel => {
		if (modelCache.has(category)) return modelCache.get(category);
		const list = nameMap.get(type);
		if (list && list.length > 0) {
			const chain = buildModel(list);
			chainMap.set(type, chain);
			return chain;
		}
		return;
	};

	const buildModel = (sourceSequences: string[]): WeightedModel => {
		let chain: RawModel = {
			termCount: {},
			termLength: {},
			initialUnit: {}
		};
		for (const sequence of list) {
			let names = item.split(/\s+/);
			chain = incrementChain(chain, 'parts', names.length);
			for (let name of names) {
				chain = incrementChain(chain, 'nameLength', name.length);
				let c = name.slice(0, 1);
				chain = incrementChain(chain, 'initial', c);
				let string = name.slice(1);
				let last_c = c;
				while (string.length > 0) {
					let c = string.slice(0, 1);
					chain = incrementChain(chain, last_c, c);
					string = string.slice(1);
					last_c = c;
				}
			}
		}
		return scaleChain(chain);
	};

	const incrementChain = (chain: RawChain, key: string, token: string) => {
		if (chain[key]) {
			if (chain[key][token]) {
				chain[key][token]++;
			} else {
				chain[key][token] = 1;
			}
		} else {
			chain[key] = {};
			chain[key][token] = 1;
		}
		return chain;
	};

	const scaleChain = (chain: RawChain): ScaledChain => {
		let tableLength: TableLengthMap = {};
		Object.keys(chain).forEach((key: string) => {
			tableLength[key] = 0;
			Object.keys(chain[key]).forEach((token) => {
				let count = chain[key][token];
				let weighted = Math.floor(Math.pow(count, 1.3));
				chain[key][token] = weighted;
				tableLength[key] += weighted;
			});
		});
		chain['tableLength'] = tableLength;
		return chain;
	};

	const markovName = (chain: ScaledChain) => {
		let parts = selectLink(chain, 'parts');
		let names = [];
		for (let i = 0; i < parts; i++) {
			let nameLength = selectLink(chain, 'nameLength');
			let c = selectLink(chain, 'initial');
			let name = c;
			let lastC = c;
			while (name.length < nameLength) {
				c = selectLink(chain, lastC);
				if (!c) break;
				name += c;
				lastC = c;
			}
			names.push(name);
		}
		return names.join(' ');
	};

	const selectLink = (chain: RawChain, key: string) => {
		let len = chain.tableLength[key];
		if (!len) return false;
		let idx = Math.floor(Math.random() * len);
		let tokens = Object.keys(chain[key]);
		let acc = 0;
		for (let i = 0; i < tokens.length; i++) {
			let token = tokens[i];
			acc += chain[key][token];
			if (acc > idx) return token;
		}
		return false;
	};
</script>

<div class="p-2">
	<h1 class="text-xl text-center">Markov Gen</h1>
	<div>
		<select>
			{#each nameTypes as name}
				<option value={name}>{name}</option>
			{/each}
		</select>
		<p>{generateName('egyptian')}</p>
	</div>
</div>
