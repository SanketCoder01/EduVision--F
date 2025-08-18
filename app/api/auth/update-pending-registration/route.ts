import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server';
import { Buffer } from 'buffer';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { pending_registration_id, image } = await request.json();

    if (!pending_registration_id || !image) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    // Decode base64 image
    const base64Data = image.replace(/^data:image\/jpeg;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Upload to Supabase Storage
    const filePath = `face-captures/${pending_registration_id}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('faces') // Ensure you have a 'faces' bucket
      .upload(filePath, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true, // Overwrite if exists
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ message: 'Failed to upload image.' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('faces').getPublicUrl(filePath);
    const faceUrl = urlData.publicUrl;

    // Update pending_registrations table
    const { error: dbError } = await supabase
      .from('pending_registrations')
      .update({
        face_url: faceUrl,
        status: 'pending_approval', // Keep status as pending for admin
        face_registered: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pending_registration_id);

    if (dbError) {
      console.error('Database update error:', dbError);
      return NextResponse.json({ message: 'Failed to update registration.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: faceUrl });

  } catch (error: any) {
    console.error('Update pending registration error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
