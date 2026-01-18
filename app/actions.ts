'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAdminStorage } from '@/lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';

export async function processVoiceNote(formData: FormData) {
    // Initialize Gemini inside the function scope to ensure environment variables are ready
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    try {
        console.log('[processVoiceNote] Starting processing...');
        console.log('[processVoiceNote] GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
        console.log('[processVoiceNote] VOICE_CLIENT_EMAIL present:', !!process.env.VOICE_CLIENT_EMAIL);

        const file = formData.get('file') as File;
        if (!file) throw new Error('No audio file provided');

        // 1. Convert File to Buffer for Server-side processing
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 2. Upload to Firebase Storage using Admin SDK
        // This bypasses CORS and security rules entirely
        const bucket = getAdminStorage().bucket();
        const fileName = `guest-voice-demos/${Date.now()}-${uuidv4()}.webm`;
        const fileRef = bucket.file(fileName);

        console.log(`[processVoiceNote] Attempting admin upload to: ${bucket.name}/${fileName}`);

        await fileRef.save(buffer, {
            metadata: {
                contentType: file.type || 'audio/webm',
            },
            public: true, // Make it public for easy URL generation
        });

        // Generate a signed URL or a public URL
        // For a demo, a long-lived signed URL or public URL is easiest
        const [downloadUrl] = await fileRef.getSignedUrl({
            action: 'read',
            expires: '03-01-2500', // Far future
        });

        console.log(`[processVoiceNote] Upload successful. URL: ${downloadUrl}`);

        // 3. Prepare Base64 for Gemini
        const base64Audio = buffer.toString('base64');

        // 4. Initialize Gemini 2.5 Flash
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // 5. Process Audio
        const prompt = `
      Please perform the following tasks based on the provided audio:
      1. Transcribe the audio precisely.
      2. Provide a "Professional Summary" of the content, highlighting the core intent or request.
      
      Return the result in this exact JSON format:
      {
        "transcript": "...",
        "summary": "..."
      }
      Do not include any other text or markdown formatting in your response.
    `;

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: file.type || 'audio/webm',
                    data: base64Audio
                }
            },
            prompt,
        ]);

        const responseText = result.response.text();
        const jsonString = responseText.replace(/```json|```/g, '').trim();
        const data = JSON.parse(jsonString);

        return {
            success: true,
            transcript: data.transcript,
            summary: data.summary,
            fileUrl: downloadUrl,
        };
    } catch (error) {
        console.error('Error in processVoiceNote (Admin Side):', error);
        const errorMessage = error instanceof Error ? error.message : 'Something went wrong';

        // Check for common admin errors
        if (errorMessage.includes('credentials')) {
            return {
                success: false,
                error: 'Firebase Admin credentials missing. Please check your service account configuration.',
            };
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}
