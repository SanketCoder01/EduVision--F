import { ContentData } from '../types';

const supabaseUrl = 'https://jtguryzyprgqraimyimt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z3VyeXp5cHJncXJhaW15aW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODIxNTMsImV4cCI6MjA2MjU1ODE1M30.798s8F7LDFsit82qTGZ7X97ww9SAQvmawIDpNgANeYE';

// Mock Supabase client with better error handling
export const mockSupabase = {
  from: (table: string) => ({
    select: () => {
      // Mock successful response
      return Promise.resolve({ 
        data: null, // Return null to test default content loading
        error: null 
      });
    },
    insert: (data: any) => {
      console.log('Mock insert:', data);
      return Promise.resolve({ data, error: null });
    },
    update: (data: any) => {
      console.log('Mock update:', data);
      return Promise.resolve({ data, error: null });
    },
    delete: () => Promise.resolve({ data: null, error: null })
  }),
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: File) => {
        console.log('Mock upload:', path, file.name);
        return Promise.resolve({ 
          data: { path: `${bucket}/${path}` }, 
          error: null 
        });
      },
      getPublicUrl: (path: string) => ({ 
        data: { 
          publicUrl: `${supabaseUrl}/storage/v1/object/public/${path}` 
        } 
      })
    })
  }
};

export const loadContentFromDatabase = async (): Promise<ContentData | null> => {
  try {
    const { data, error } = await mockSupabase.from('content').select();
    if (data && data.length > 0) {
      return data[0];
    }
    // Return null if no data found
    return null;
  } catch (error) {
    console.error('Error loading content:', error);
    return null;
  }
};

export const saveContentToDatabase = async (updatedContent: ContentData): Promise<boolean> => {
  try {
    if (!updatedContent || !updatedContent.id) {
      console.error('Invalid content data');
      return false;
    }

    const { data, error } = await mockSupabase
      .from('content')
      .update(updatedContent);
    
    if (!error) {
      console.log('Content saved successfully:', data);
      return true;
    }
    console.error('Error saving content:', error);
    return false;
  } catch (error) {
    console.error('Error saving content:', error);
    return false;
  }
};

export const uploadImageToStorage = async (file: File, path: string): Promise<string | null> => {
  try {
    if (!file || !path) {
      console.error('Invalid file or path');
      return null;
    }

    const { data, error } = await mockSupabase.storage
      .from('images')
      .upload(path, file);
    
    if (data && !error) {
      const { data: publicUrl } = mockSupabase.storage
        .from('images')
        .getPublicUrl(data.path);
      
      return publicUrl.publicUrl;
    }
    console.error('Error uploading image:', error);
    return null;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};