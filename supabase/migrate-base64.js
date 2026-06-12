const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

console.log('Connecting to Supabase:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const base64ToBuffer = (base64) => {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const buffer = Buffer.from(parts[1], 'base64');
  return { buffer, contentType };
};

async function migrate() {
  try {
    const { data: photos, error } = await supabase
      .from('pf_photos')
      .select('*');

    if (error) throw error;
    console.log(`Found ${photos.length} photos in database.`);

    let migratedCount = 0;

    for (const photo of photos) {
      let updatedFields = {};

      // Check original_url
      if (photo.original_url && photo.original_url.startsWith('data:image/')) {
        console.log(`Migrating original_url for photo ID ${photo.id}...`);
        const { buffer, contentType } = base64ToBuffer(photo.original_url);
        const ext = contentType.split('/')[1] || 'jpg';
        const storagePath = `${photo.project_id}/${Date.now()}-${Math.random().toString(36).substring(2, 6)}-original.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photos')
          .upload(storagePath, buffer, {
            contentType: contentType,
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error(`Failed to upload original for photo ${photo.id}:`, uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('photos')
            .getPublicUrl(storagePath);
          updatedFields.original_url = urlData.publicUrl;
          console.log(`Uploaded original to: ${urlData.publicUrl}`);
        }
      }

      // Check processed_url
      if (photo.processed_url && photo.processed_url.startsWith('data:image/')) {
        console.log(`Migrating processed_url for photo ID ${photo.id}...`);
        const { buffer, contentType } = base64ToBuffer(photo.processed_url);
        const ext = contentType.split('/')[1] || 'jpg';
        const storagePath = `${photo.project_id}/${Date.now()}-${Math.random().toString(36).substring(2, 6)}-processed.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photos')
          .upload(storagePath, buffer, {
            contentType: contentType,
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error(`Failed to upload processed for photo ${photo.id}:`, uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('photos')
            .getPublicUrl(storagePath);
          updatedFields.processed_url = urlData.publicUrl;
          console.log(`Uploaded processed to: ${urlData.publicUrl}`);
        }
      }

      if (Object.keys(updatedFields).length > 0) {
        const { error: updateError } = await supabase
          .from('pf_photos')
          .update(updatedFields)
          .eq('id', photo.id);

        if (updateError) {
          console.error(`Failed to update DB record for photo ${photo.id}:`, updateError);
        } else {
          console.log(`Successfully updated database record for photo ID ${photo.id}`);
          migratedCount++;
        }
      }
    }

    console.log(`Migration complete. Migrated ${migratedCount} photos.`);
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

migrate();
