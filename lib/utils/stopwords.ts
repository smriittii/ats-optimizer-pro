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

    // Resume-specific stopwords
    'resume', 'cv', 'curriculum', 'vitae', 'page', 'email', 'phone',
    'address', 'linkedin', 'github', 'portfolio',
]);

// Additional common business/resume words that shouldn't be considered keywords
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
