import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmvcxoooaegysjueusvr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdmN4b29vYWVneXNqdWV1c3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDQwMzksImV4cCI6MjA2NzkyMDAzOX0.GVfHXThUgGpsLREmw5_7xFIx4z-bkjYnoHhZlc8fG8A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
