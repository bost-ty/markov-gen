# markov-gen

The funny little Markov chain generator that could.

A small library and frontend for generating and interacting with [Markov chains](https://en.wikipedia.org/wiki/Markov_chain), specifically word- and token-based Markov chains.

## Usage 

`src/lib/markov.ts` (`$lib/markov`) exports a `MarkovGenerator` class:

```ts
const input_data = ['markov', 'chains', 'are', 'cool'];
const markov = new MarkovGenerator(input_data);

const oneNewTerm = markov.generate();
const manyNewTerms = markov.generateList(100);
```

Try out the frontend (`+page.svelte`) via `npm run dev -- --open`.

## How it works

The markov-gen frontend implements the results of the Markov chain-based term generation in a reactive [`SvelteSet`](https://svelte.dev/docs/svelte/svelte-reactivity#SvelteSet) (a state-reactive Set built in to Svelte) to automatically prune repeated terms in the output, with a **hardcoded 500 term-generation attempt limit** to avoid problems where the amount of data provided is insufficient to generate the requested number of **unique terms**. This is done rather than trying to compare the number of terms in the data vs. the number of requested terms in the `generateNew` function.

To get started, try the default term list or make up your own in the text area.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of the app:

```bash
npm run build
```

After building, preview the production build with `npm run preview`.
