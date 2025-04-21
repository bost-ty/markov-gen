/** Describes a map from string choices to their numeric frequency/count. */
interface FrequencyMap {
	[choice: string]: number;
}

/** Describes the raw frequency data collected from source sequences. */
interface RawModel {
	termCount: FrequencyMap; // Frequency of specific counts of terms per sequence
	termLength: FrequencyMap; // Frequency of specific lengths of individual terms
	initialUnit: FrequencyMap; // Frequency of specific initial units of terms
	/** Index signature for transition frequencies: maps a unit to the frequencies of units that follow it. */
	[unitKey: string]: FrequencyMap;
}

/** Describes the map holding total weighted counts for each category in the model. */
interface WeightTotalsMap {
	[category: string]: number; // e.g., 'termCount', 'termLength', 'initialUnit', 'a', 'b', etc.
}

/** Describes the final model after weighting and adding total weights for selection. */
interface WeightedModel extends RawModel {
	/** Holds the total weighted counts for each category, used for weighted random selection. */
	selectionWeights: WeightTotalsMap;
}

// --- Markov Generator Class ---

export class MarkovGenerator {
	/** The fully processed and weighted statistical model. */
	private readonly model: WeightedModel;

	/**
	 * Creates and trains a MarkovGenerator instance from source sequences.
	 * @param sourceSequences An array of strings representing the sequences to learn from.
	 */
	constructor(sourceSequences: string[]) {
		if (!sourceSequences || sourceSequences.length === 0) {
			// For now, create a minimal valid WeightedModel to avoid runtime errors on generate()
			this.model = {
				termCount: {},
				termLength: {},
				initialUnit: {},
				selectionWeights: {}
			};
		} else {
			const rawModel = MarkovGenerator.buildRawModel(sourceSequences);
			this.model = MarkovGenerator.applyWeighting(rawModel);
		}
	}

	// --- Public API Methods ---

	/** Generates a single sequence based on the learned model. */
	public generate(): string {
		const termCountStr = this.selectChoice('termCount');
		const termCount = parseInt(termCountStr || '1', 10); // Default 1 term

		const terms: string[] = [];
		for (let i = 0; i < termCount; i++) {
			const termLengthStr = this.selectChoice('termLength');
			const termLength = parseInt(termLengthStr || '6', 10); // Default length 6

			const initial = this.selectChoice('initialUnit');
			if (!initial || termLength <= 0) {
				terms.push(); // Placeholder if generation fails
				throw new Error('No initial or invalid term length');
			}

			let currentTerm = initial;
			let previousUnit = initial;

			while (currentTerm.length < termLength) {
				const nextUnit = this.selectChoice(previousUnit); // Use previous unit as category key
				if (!nextUnit) break; // End term if no transition found
				currentTerm += nextUnit;
				previousUnit = nextUnit;
			}
			terms.push(currentTerm);
		}
		return terms.join(' ');
	}

	/** Generates a list of sequences based on the learned model. */
	public generateList(count: number): string[] {
		const list: string[] = [];
		const numToGenerate = Math.max(0, Math.floor(count));
		for (let i = 0; i < numToGenerate; i++) {
			list.push(this.generate());
		}
		return list;
	}

	// --- Private Helper Methods ---

	/** Selects a choice from a category based on weighted frequencies within the model. */
	private selectChoice(category: string): string | false {
		const weights = this.model.selectionWeights;
		// Basic checks for valid category and weight
		if (!weights || typeof weights[category] === 'undefined') return false;
		const totalWeight = weights[category];
		if (totalWeight <= 0) return false;

		const frequencyMap = this.model[category];
		if (!frequencyMap || typeof frequencyMap !== 'object') return false;

		const choices = Object.keys(frequencyMap);
		if (choices.length === 0) return false;

		const randomIndex = Math.floor(Math.random() * totalWeight);
		let accumulatedWeight = 0;

		for (const choice of choices) {
			accumulatedWeight += frequencyMap[choice]; // Use weighted count
			if (accumulatedWeight > randomIndex) {
				return choice; // Selected
			}
		}
		return choices[choices.length - 1] || false;
	}

	private static buildRawModel(sourceSequences: string[]): RawModel {
		const increment = (
			model: RawModel,
			category: string,
			choice: string | number
		): void => {
			const choiceStr = String(choice);
			if (!choiceStr) return; // Skip empty

			if (!model[category]) {
				model[category] = {};
			}
			const categoryMap = model[category];
			categoryMap[choiceStr] = (categoryMap[choiceStr] || 0) + 1;
		};

		// Initialize model structure
		let model: RawModel = { termCount: {}, termLength: {}, initialUnit: {} };

		for (const sequence of sourceSequences) {
			if (!sequence || typeof sequence !== 'string') continue;
			const terms = sequence.split(/\s+/).filter((t) => t.length > 0);
			if (terms.length === 0) continue;

			increment(model, 'termCount', terms.length);

			for (const term of terms) {
				increment(model, 'termLength', term.length);

				const initial = term.slice(0, 1);
				if (!initial) continue;
				increment(model, 'initialUnit', initial);

				let previousUnit = initial;
				for (let i = 1; i < term.length; i++) {
					const currentUnit = term.slice(i, i + 1);
					increment(model, previousUnit, currentUnit); // Use previous unit as category key
					previousUnit = currentUnit;
				}
			}
		}
		return model;
	}

	/** Applies weighting to frequencies and calculates total weights. Modifies the input object. */
	private static applyWeighting(model: RawModel): WeightedModel {
		const selectionWeights: WeightTotalsMap = {};

		for (const category in model) {
			if (Object.prototype.hasOwnProperty.call(model, category)) {
				selectionWeights[category] = 0;
				const frequencyMap = model[category];

				for (const choice in frequencyMap) {
					if (Object.prototype.hasOwnProperty.call(frequencyMap, choice)) {
						const count = frequencyMap[choice];
						const weightedCount = Math.floor(Math.pow(count, 1.3));
						frequencyMap[choice] = weightedCount; // Update count in place
						selectionWeights[category] += weightedCount;
					}
				}
			}
		}
		// Add selectionWeights and assert the new type
		(model as WeightedModel).selectionWeights = selectionWeights;
		return model as WeightedModel;
	}
}

// --- Example Usage ---

// const egyptianNames = [
//     'Anubis', 'Ra', 'Isis', 'Osiris', 'Horus', 'Seth', 'Thoth',
//     'Hathor', 'Sekhmet', 'Ptah', 'Bastet', 'Sobek', 'Nephthys',
//     'Amun', 'Mut', 'Khonsu', 'Maat', 'Geb', 'Nut'
// ];

// // Create an instance for Egyptian names
// const egyptianGenerator = new MarkovGenerator(egyptianNames);

// // Generate sequences
// console.log("Generating Egyptian sequences:");
// console.log(egyptianGenerator.generateList(5));

// console.log("\nGenerating one sequence:");
// console.log(egyptianGenerator.generate());

// // Example with different data
// const shortWords = ['cat', 'dog', 'rat', 'bat', 'hat', 'mat', 'sat', 'run', 'sun', 'fun'];
// const wordGenerator = new MarkovGenerator(shortWords);
// console.log("\nGenerating short words:");
// console.log(wordGenerator.generateList(5));

// // Example with empty data
// const emptyGenerator = new MarkovGenerator([]);
// console.log("\nGenerating from empty data:");
// console.log(emptyGenerator.generate()); // Should throw Error
