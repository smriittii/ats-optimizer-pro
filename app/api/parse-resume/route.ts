// API Route: Parse uploaded resume (PDF or DOCX)
import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/parsing/pdf';
import { extractTextFromDOCX } from '@/lib/parsing/docx';
import { detectSections } from '@/lib/utils/text';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Check file type
        const fileType = file.name.toLowerCase();
        if (!fileType.endsWith('.pdf') && !fileType.endsWith('.docx')) {
            return NextResponse.json(
                { error: 'Only PDF and DOCX files are supported' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract text based on file type
        let text: string;
        if (fileType.endsWith('.pdf')) {
            text = await extractTextFromPDF(buffer);
        } else {
            text = await extractTextFromDOCX(buffer);
        }

        // Detect sections
        const sections = detectSections(text);

        return NextResponse.json({
            text,
            sections,
        });
    } catch (error: any) {
        console.error('Resume parsing error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to parse resume' },
            { status: 500 }
        );
    }
}
