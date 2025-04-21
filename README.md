# markov-gen

The funny little Markov chain generator that could.

## Usage 

`src/lib/markov.ts` (`$lib/markov`) exports a `MarkovGenerator`:

```ts
const data = ['markov', 'chains', 'are', 'cool'];
const markov = new MarkovGenerator(data);

let newTerm = markov.generate();

let manyNewTerms = markov.generateList(100);
```

See "Developing" below for more information.

The frontend (`+page.svelte`) is demo'd via `npm run dev -- --open`.
It implements the results of generation as a reactive `SvelteSet` to automatically prune repeated terms in the output, with a hardcoded 500 attempt limit to avoid problems where the amount of data provided is insufficient to generate the requested number of unique terms. This is done rather than trying to compare the number of terms in the data vs. the number of requested terms in the `generateNew` function.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
