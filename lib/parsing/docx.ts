// DOCX text extraction using mammoth
import mammoth from 'mammoth';
import { cleanText } from '../utils/text';

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
    try {
        const result = await mammoth.extractRawText({ buffer });
        return cleanText(result.value);
    } catch (error) {
        console.error('DOCX parsing error:', error);
        throw new Error('Failed to parse DOCX file. Please ensure it is a valid Word document.');
    }
}
