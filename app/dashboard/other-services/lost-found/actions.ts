'use server';

import { createClient } from '@/lib/supabase/server';
import { LostFoundItem } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function submitLostFoundItem(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to report an item.' };
  }

  const imageFile = formData.get('image') as File;
  let imageUrl = null;

  if (imageFile && imageFile.size > 0) {
    const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lost-and-found')
      .upload(fileName, imageFile);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return { error: 'Failed to upload image. Please try again.' };
    }
    
    const { data: urlData } = supabase.storage.from('lost-and-found').getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }

  const itemData = {
    reported_by_id: user.id,
    reporter_name: formData.get('name') as string,
    reporter_department: formData.get('department') as string,
    reporter_phone: formData.get('phone') as string,
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    location: formData.get('location') as string,
    is_lost: formData.get('type') === 'lost',
    image_url: imageUrl,
  };

  const { error } = await supabase.from('lost_found_items').insert(itemData);

  if (error) {
    console.error('Error submitting lost/found item:', error);
    return { error: 'Failed to submit item. Please try again.' };
  }

  revalidatePath('/dashboard/other-services/lost-found');
  return { success: 'Item reported successfully.' };
}

export async function getLostFoundItems(): Promise<LostFoundItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('lost_found_items')
    .select('*')
    .order('reported_at', { ascending: false });

  if (error) {
    console.error('Error fetching lost/found items:', error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    isLost: item.is_lost,
    location: item.location,
    reportedById: item.reported_by_id,
    reporterName: item.reporter_name,
    reporterDepartment: item.reporter_department,
    reporterPhone: item.reporter_phone,
    reportedAt: new Date(item.reported_at),
    imageUrl: item.image_url,
  }));
}
