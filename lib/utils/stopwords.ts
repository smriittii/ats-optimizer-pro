// Comprehensive stopwords list for keyword extraction
export const STOPWORDS = new Set([
    // Articles
    'a', 'an', 'the',

    // Conjunctions
    'and', 'but', 'or', 'nor', 'for', 'yet', 'so',

    // Prepositions
    'in', 'on', 'at', 'to', 'from', 'by', 'with', 'about', 'as', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'between',
    'under', 'over', 'of', 'off', 'up', 'down', 'out',

    // Pronouns
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
    'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'mine',
    'yours', 'hers', 'ours', 'theirs', 'this', 'that', 'these', 'those',
    'who', 'whom', 'whose', 'which', 'what',

    // Verbs (common)
    'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
    'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'must', 'can', 'shall',

    // Common words
    'not', 'no', 'yes', 'if', 'when', 'where', 'why', 'how', 'all',
    'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
    'such', 'than', 'too', 'very', 'just', 'now', 'then', 'there',
    'here', 'well', 'only', 'also', 'again', 'however', 'therefore',

    // Generic action verbs (too vague to be keywords)
    'make', 'made', 'making', 'get', 'got', 'getting', 'take', 'took',
    'taking', 'give', 'gave', 'giving', 'use', 'used', 'using', 'find',
    'found', 'finding', 'know', 'knew', 'knowing', 'think', 'thought',
    'see', 'saw', 'seen', 'come', 'came', 'coming', 'want', 'wanted',
    'look', 'looked', 'looking', 'need', 'needed', 'needs', 'feel',
    'keep', 'kept', 'let', 'put', 'seem', 'seemed', 'ask', 'asked',
    'show', 'showed', 'try', 'tried', 'call', 'called', 'help', 'helped',
    'assist', 'assisted', 'manage', 'managed', 'include', 'included',
    'ensure', 'ensured', 'provide', 'provided', 'support', 'supported',
    'create', 'created', 'understand', 'understood', 'explore', 'explored',

    // Generic adjectives (too vague)
    'new', 'old', 'good', 'bad', 'great', 'large', 'small', 'high',
    'low', 'next', 'last', 'long', 'little', 'own', 'right', 'big',
    'easy', 'hard', 'free', 'real', 'best', 'sure', 'better', 'true',
    'full', 'early', 'able', 'different', 'important', 'possible',
    'various', 'general', 'specific', 'similar', 'additional', 'current',

    // Generic business words (too vague)
    'impact', 'innovative', 'innovation', 'solutions', 'solution',
    'process', 'processes', 'product', 'products', 'service', 'services',
    'business', 'businesses', 'document', 'documents', 'technology',
    'technologies', 'members', 'managers', 'challenges', 'challenge',
    'closely', 'proficiency', 'needs', 'assist', 'creating',

    // Resume-specific stopwords
    'resume', 'cv', 'curriculum', 'vitae', 'page', 'email', 'phone',
    'address', 'linkedin', 'github', 'portfolio',
]);

export const COMMON_RESUME_WORDS = new Set([
    'experience', 'education', 'skills', 'summary', 'objective',
    'professional', 'work', 'history', 'responsibilities', 'duties',
    'accomplishments', 'achievements', 'position', 'role', 'title',
    'company', 'organization', 'university', 'college', 'school',
    'degree', 'certification', 'certificate', 'award', 'honor',
    'references', 'available', 'upon', 'request',
]);

export function isStopword(word: string): boolean {
    const lower = word.toLowerCase();
    return STOPWORDS.has(lower) || COMMON_RESUME_WORDS.has(lower);
}