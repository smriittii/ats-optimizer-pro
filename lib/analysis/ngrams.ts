// N-gram extraction for keyword analysis
import { tokenize } from '../utils/text';
import { isStopword } from '../utils/stopwords';
import type { NGram } from '@/types';

/**
 * Extract unigrams (single words) from text
 */
export function extractUnigrams(text: string): NGram[] {
    const tokens = tokenize(text);
    const counts: { [key: string]: number } = {};

    for (const token of tokens) {
        if (token.length > 2 && !isStopword(token)) {
            counts[token] = (counts[token] || 0) + 1;
        }
    }

    return Object.entries(counts)
        .map(([text, count]) => ({ text, count, type: 'unigram' as const }))
        .sort((a, b) => b.count - a.count);
}

/**
 * Extract bigrams (two-word phrases) from text
 */
export function extractBigrams(text: string): NGram[] {
    const tokens = tokenize(text);
    const counts: { [key: string]: number } = {};

    for (let i = 0; i < tokens.length - 1; i++) {
        const bigram = `${tokens[i]} ${tokens[i + 1]}`;

        // Skip if either word is a stopword or too short
        if (tokens[i].length > 2 && tokens[i + 1].length > 2 &&
            !isStopword(tokens[i]) && !isStopword(tokens[i + 1])) {
            counts[bigram] = (counts[bigram] || 0) + 1;
        }
    }

    return Object.entries(counts)
        .map(([text, count]) => ({ text, count, type: 'bigram' as const }))
        .filter(({ count }) => count >= 2) // Only include bigrams that appear multiple times
        .sort((a, b) => b.count - a.count);
}

/**
 * Extract trigrams (three-word phrases) from text
 */
export function extractTrigrams(text: string): NGram[] {
    const tokens = tokenize(text);
    const counts: { [key: string]: number } = {};

    for (let i = 0; i < tokens.length - 2; i++) {
        const trigram = `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`;

        // Skip if any word is a stopword or too short
        const words = [tokens[i], tokens[i + 1], tokens[i + 2]];
        const validWords = words.every(w => w.length > 2 && !isStopword(w));

        if (validWords) {
            counts[trigram] = (counts[trigram] || 0) + 1;
        }
    }

    return Object.entries(counts)
        .map(([text, count]) => ({ text, count, type: 'trigram' as const }))
        .filter(({ count }) => count >= 2) // Only include trigrams that appear multiple times
        .sort((a, b) => b.count - a.count);
}

/**
 * Extract all n-grams (unigrams, bigrams, trigrams) and merge them
 */
export function extractAllNGrams(text: string, maxCount: number = 40): NGram[] {
    const unigrams = extractUnigrams(text);
    const bigrams = extractBigrams(text);
    const trigrams = extractTrigrams(text);

    // Prioritize trigrams > bigrams > unigrams when scoring
    const weighted = [
        ...trigrams.map(ng => ({ ...ng, weight: ng.count * 3 })),
        ...bigrams.map(ng => ({ ...ng, weight: ng.count * 2 })),
        ...unigrams.map(ng => ({ ...ng, weight: ng.count * 1 })),
    ];

    return weighted
        .sort((a, b) => b.weight - a.weight)
        .slice(0, maxCount)
        .map(({ text, count, type }) => ({ text, count, type }));
}
