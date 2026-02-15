// Enhanced TF-IDF with improved semantic matching
import { tokenize, cleanText } from '../utils/text';
import { isStopword } from '../utils/stopwords';

export interface TFIDFVector {
    [term: string]: number;
}

/**
 * Calculate Term Frequency (TF) for a document
 */
function calculateTF(tokens: string[]): { [term: string]: number } {
    const tf: { [term: string]: number } = {};
    const totalTerms = tokens.length;

    for (const token of tokens) {
        tf[token] = (tf[token] || 0) + 1;
    }

    // Normalize by total terms
    for (const term in tf) {
        tf[term] = tf[term] / totalTerms;
    }

    return tf;
}

/**
 * Calculate Inverse Document Frequency (IDF)
 */
function calculateIDF(documents: string[][]): { [term: string]: number } {
    const idf: { [term: string]: number } = {};
    const totalDocs = documents.length;

    // Get all unique terms
    const allTerms = new Set<string>();
    documents.forEach(doc => doc.forEach(term => allTerms.add(term)));

    // Calculate IDF for each term
    for (const term of allTerms) {
        const docsWithTerm = documents.filter(doc => doc.includes(term)).length;
        idf[term] = Math.log((totalDocs + 1) / (docsWithTerm + 1)) + 1; // Add smoothing
    }

    return idf;
}

/**
 * Create TF-IDF vectors for multiple documents (improved version)
 */
export function createTFIDFVectors(texts: string[]): TFIDFVector[] {
    // Tokenize all documents
    const tokenizedDocs = texts.map(text => {
        const cleaned = cleanText(text);
        const tokens = tokenize(cleaned);
        return tokens.filter(token => !isStopword(token) && token.length > 1);
    });

    // Calculate IDF across all documents
    const idf = calculateIDF(tokenizedDocs);

    // Create TF-IDF vectors
    return tokenizedDocs.map(tokens => {
        const tf = calculateTF(tokens);
        const tfidf: TFIDFVector = {};

        for (const term in tf) {
            tfidf[term] = tf[term] * (idf[term] || 0);
        }

        return tfidf;
    });
}

/**
 * Calculate cosine similarity between two TF-IDF vectors
 */
export function cosineSimilarity(v1: TFIDFVector, v2: TFIDFVector): number {
    const terms1 = Object.keys(v1);
    const terms2 = Object.keys(v2);
    const allTerms = new Set([...terms1, ...terms2]);

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (const term of allTerms) {
        const val1 = v1[term] || 0;
        const val2 = v2[term] || 0;

        dotProduct += val1 * val2;
        magnitude1 += val1 * val1;
        magnitude2 += val2 * val2;
    }

    if (magnitude1 === 0 || magnitude2 === 0) {
        return 0;
    }

    return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}

/**
 * Enhanced semantic similarity with multiple matching strategies
 */
export function calculateSemanticSimilarity(text1: string, text2: string): number {
    // 1. TF-IDF Cosine Similarity (main method)
    const vectors = createTFIDFVectors([text1, text2]);
    const tfidfSimilarity = cosineSimilarity(vectors[0], vectors[1]);

    // 2. Jaccard Similarity (token overlap)
    const tokens1 = new Set(
        tokenize(cleanText(text1)).filter(t => !isStopword(t) && t.length > 1)
    );
    const tokens2 = new Set(
        tokenize(cleanText(text2)).filter(t => !isStopword(t) && t.length > 1)
    );

    const intersection = new Set([...tokens1].filter(t => tokens2.has(t)));
    const union = new Set([...tokens1, ...tokens2]);
    const jaccardSimilarity = union.size > 0 ? intersection.size / union.size : 0;

    // 3. Longest Common Subsequence similarity (for phrases)
    const lcsSimilarity = calculateLCSSimilarity(text1, text2);

    // 4. Bigram overlap similarity
    const bigramSimilarity = calculateBigramSimilarity(text1, text2);

    // Weighted combination of all methods
    const combinedScore =
        tfidfSimilarity * 0.40 +    // TF-IDF (most important)
        jaccardSimilarity * 0.30 +  // Token overlap
        lcsSimilarity * 0.15 +      // Phrase similarity
        bigramSimilarity * 0.15;    // Bigram overlap

    // Convert to 0-100 scale and boost
    const rawScore = combinedScore * 100;

    // Apply generous boost curve
    let boostedScore: number;
    if (rawScore >= 50) {
        boostedScore = 75 + (rawScore - 50) * 0.5; // 50+ = 75-100
    } else if (rawScore >= 30) {
        boostedScore = 60 + (rawScore - 30) * 0.75; // 30-50 = 60-75
    } else if (rawScore >= 15) {
        boostedScore = 45 + (rawScore - 15) * 1.0; // 15-30 = 45-60
    } else {
        boostedScore = rawScore * 3; // 0-15 = 0-45
    }

    return Math.round(Math.min(100, boostedScore));
}

/**
 * Calculate bigram similarity
 */
function calculateBigramSimilarity(text1: string, text2: string): number {
    const getBigrams = (text: string): Set<string> => {
        const tokens = tokenize(cleanText(text)).filter(t => !isStopword(t) && t.length > 1);
        const bigrams = new Set<string>();
        for (let i = 0; i < tokens.length - 1; i++) {
            bigrams.add(`${tokens[i]} ${tokens[i + 1]}`);
        }
        return bigrams;
    };

    const bigrams1 = getBigrams(text1);
    const bigrams2 = getBigrams(text2);

    if (bigrams1.size === 0 || bigrams2.size === 0) return 0;

    const intersection = new Set([...bigrams1].filter(b => bigrams2.has(b)));
    const union = new Set([...bigrams1, ...bigrams2]);

    return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Calculate normalized LCS similarity
 */
function calculateLCSSimilarity(text1: string, text2: string): number {
    const words1 = tokenize(cleanText(text1)).filter(t => !isStopword(t) && t.length > 1);
    const words2 = tokenize(cleanText(text2)).filter(t => !isStopword(t) && t.length > 1);

    if (words1.length === 0 || words2.length === 0) return 0;

    // Simplified LCS for performance
    const lcsLength = calculateLCS(words1, words2);
    const maxLength = Math.max(words1.length, words2.length);

    return lcsLength / maxLength;
}

/**
 * Calculate LCS length (simplified for performance)
 */
function calculateLCS(arr1: string[], arr2: string[]): number {
    const m = arr1.length;
    const n = arr2.length;

    // Use space-optimized version for large arrays
    if (m > 100 || n > 100) {
        return calculateLCSFast(arr1.slice(0, 100), arr2.slice(0, 100));
    }

    const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (arr1[i - 1] === arr2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    return dp[m][n];
}

/**
 * Fast LCS calculation for large arrays (space-optimized)
 */
function calculateLCSFast(arr1: string[], arr2: string[]): number {
    const m = arr1.length;
    const n = arr2.length;

    let prev = Array(n + 1).fill(0);
    let curr = Array(n + 1).fill(0);

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (arr1[i - 1] === arr2[j - 1]) {
                curr[j] = prev[j - 1] + 1;
            } else {
                curr[j] = Math.max(prev[j], curr[j - 1]);
            }
        }
        [prev, curr] = [curr, prev];
    }

    return prev[n];
}
