// PDF text extraction using pdf-parse
import PDFParse from 'pdf-parse';
import { cleanText } from '../utils/text';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
        const data = await PDFParse(buffer);
        return cleanText(data.text);
    } catch (error) {
        console.error('PDF parsing error:', error);
        throw new Error('Failed to parse PDF file. Please ensure it is a valid PDF.');
    }
}
