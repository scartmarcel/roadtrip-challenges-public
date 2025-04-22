import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nokoswzhxipknbyghidb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5va29zd3poeGlwa25ieWdoaWRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMjMzNzAsImV4cCI6MjA2MDg5OTM3MH0.xmc_rUhxBt93BUtfZZGPQw1Wn2f_hd6Nzvp_mYDStWY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);