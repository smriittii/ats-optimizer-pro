// TF-IDF vectorization for semantic similarity (100% local, no APIs)
import { tokenize } from '../utils/text';
import { isStopword } from '../utils/stopwords';
import type { TFIDFVector } from '@/types';

/**
 * Calculate term frequency (TF) for a document
 */
function calculateTF(tokens: string[]): { [term: string]: number } {
    const tf: { [term: string]: number } = {};
    const totalTokens = tokens.length;

    for (const token of tokens) {
        if (!isStopword(token) && token.length > 2) {
            tf[token] = (tf[token] || 0) + 1;
        }
    }

    // Normalize by total tokens
    for (const term in tf) {
        tf[term] = tf[term] / totalTokens;
    }

    return tf;
}

/**
 * Calculate inverse document frequency (IDF) for a corpus
 */
function calculateIDF(documents: string[][]): { [term: string]: number } {
    const idf: { [term: string]: number } = {};
    const numDocs = documents.length;
    const docFrequency: { [term: string]: number } = {};

    // Count how many documents contain each term
    for (const tokens of documents) {
        const uniqueTerms = new Set(tokens.filter(t => !isStopword(t) && t.length > 2));
        for (const term of uniqueTerms) {
            docFrequency[term] = (docFrequency[term] || 0) + 1;
        }
    }

    // Calculate IDF
    for (const term in docFrequency) {
        idf[term] = Math.log(numDocs / docFrequency[term]);
    }

    return idf;
}

/**
 * Create TF-IDF vector for documents
 */
export function createTFIDFVectors(texts: string[]): TFIDFVector[] {
    const tokenizedDocs = texts.map(text => tokenize(text));
    const idf = calculateIDF(tokenizedDocs);
    const vectors: TFIDFVector[] = [];

    for (const tokens of tokenizedDocs) {
        const tf = calculateTF(tokens);
        const vector: TFIDFVector = {};

        for (const term in tf) {
            if (idf[term]) {
                vector[term] = tf[term] * idf[term];
            }
        }

        vectors.push(vector);
    }

    return vectors;
}

/**
 * Create a single TF-IDF vector (useful for single document)
 * Uses a simple IDF approximation
 */
export function createSingleTFIDFVector(text: string): TFIDFVector {
    const tokens = tokenize(text);
    const tf = calculateTF(tokens);
    const vector: TFIDFVector = {};

    // Use a simple IDF approximation (log of inverse frequency)
    const uniqueTerms = new Set(Object.keys(tf));

    for (const term in tf) {
        // Simple approximation: higher TF = more important
        vector[term] = tf[term] * Math.log(1 + tf[term]);
    }

    return vector;
}

/**
 * Calculate magnitude of a vector
 */
function vectorMagnitude(vector: TFIDFVector): number {
    let sum = 0;
    for (const term in vector) {
        sum += vector[term] * vector[term];
    }
    return Math.sqrt(sum);
}

/**
 * Calculate dot product of two vectors
 */
function dotProduct(v1: TFIDFVector, v2: TFIDFVector): number {
    let sum = 0;
    for (const term in v1) {
        if (v2[term]) {
            sum += v1[term] * v2[term];
        }
    }
    return sum;
}

/**
 * Calculate cosine similarity between two TF-IDF vectors
 * Returns value between 0 and 1
 */
export function cosineSimilarity(v1: TFIDFVector, v2: TFIDFVector): number {
    const dot = dotProduct(v1, v2);
    const mag1 = vectorMagnitude(v1);
    const mag2 = vectorMagnitude(v2);

    if (mag1 === 0 || mag2 === 0) {
        return 0;
    }

    return dot / (mag1 * mag2);
}

/**
 * Calculate semantic similarity between two texts using TF-IDF
 * Returns score between 0 and 100
 */
export function calculateSemanticSimilarity(text1: string, text2: string): number {
    const vectors = createTFIDFVectors([text1, text2]);
    const similarity = cosineSimilarity(vectors[0], vectors[1]);

    return Math.round(similarity * 100);
}
