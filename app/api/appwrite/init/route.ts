import { NextRequest, NextResponse } from 'next/server';
import { appwriteClient } from '@/lib/appwrite-server';

export async function GET(req: NextRequest) {
  try {
    // This route can be used to trigger any Appwrite initialization logic
    // For now, we'll just confirm the client can be created.
    if (appwriteClient) {
      return NextResponse.json({ success: true, message: 'Appwrite client initialized.' });
    } else {
      throw new Error('Appwrite client failed to initialize.');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Appwrite init error:', errorMessage);
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
