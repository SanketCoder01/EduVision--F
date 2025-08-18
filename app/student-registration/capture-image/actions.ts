"use server"

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

function dataURLtoBlob(dataurl: string) {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

export async function completeRegistrationWithFace(imageData: string) {
    const supabase = createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return { error: 'User not found. Please log in again.' };
    }

    try {
        const imageBlob = dataURLtoBlob(imageData);
        const filePath = `public/faces/${user.id}/${new Date().getTime()}.jpeg`;

        const { error: uploadError } = await supabase.storage
            .from('faces')
            .upload(filePath, imageBlob, {
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) {
            console.error('Upload Error:', uploadError);
            return { error: 'Failed to upload face image.' };
        }

        const { data: { publicUrl } } = supabase.storage.from('faces').getPublicUrl(filePath);

        // Update the pending registration with face data for admin review
        const { error: dbError } = await supabase
            .from('pending_registrations')
            .update({ 
                face_url: publicUrl,
                face_data: { face_url: publicUrl },
                status: 'pending_approval'
            })
            .eq('user_id', user.id);

        if (dbError) {
            console.error('DB Update Error:', dbError);
            return { error: 'Failed to update registration with face data.' };
        }

        revalidatePath('/auth/pending-approval');
        return { success: true, message: 'Face captured! Awaiting admin approval.' };

    } catch (e: any) {
        return { error: `An unexpected error occurred: ${e.message}` };
    }
}
