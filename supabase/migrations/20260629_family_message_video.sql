alter table public.family_messages
  add column if not exists video_path text;

update storage.buckets
set
  file_size_limit = 15728640,
  allowed_mime_types = array[
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'audio/webm',
  'audio/mp4',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'video/webm',
  'video/mp4',
  'video/quicktime'
]
where id = 'family-media';
