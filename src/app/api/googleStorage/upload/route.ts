import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

// Initialize GCS client
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GCP_PROJECT_ID,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const username = formData.get('username') as string;
    const chatSessionId = formData.get('chat_session_id') as string;

    if (!file || !username || !chatSessionId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const bucketName = 'nala-rag';
    const destinationPath = `${username}/${Date.now()}_${file.name}`;

    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(destinationPath);

    // Convert File to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to GCS
    await blob.save(buffer, {
      contentType: file.type || 'application/octet-stream',
      resumable: true,
    });

    const gcsUrl = `gs://${bucketName}/${blob.name}`;

    return NextResponse.json({
      success: true,
      gcsUrl,
      fileName: file.name,
    });
  } catch (error) {
    console.error('GCS upload error:', error);
    return NextResponse.json(
      { success: false, message: `Upload failed: ${error.message}` },
      { status: 500 }
    );
  }
}